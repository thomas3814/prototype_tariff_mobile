import ExcelJS from 'exceljs';
import {
  EXCLUDED_SHEET_KEYWORDS,
  EXPORT_COUNTRIES,
  EXPORT_COUNTRY_GROUPS,
  EXPORT_COUNTRY_ORDER,
  EXPORT_COUNTRY_TO_CONTINENT,
  IMPORT_COUNTRIES,
  IMPORT_COUNTRY_GROUPS,
  IMPORT_COUNTRY_ORDER,
  IMPORT_COUNTRY_TO_CONTINENT,
  PRODUCT_FIELD_LABEL,
  getProductDisplayLabel,
  getProductId,
  isIncludedSheet,
  sortCountries,
  sortProductDefinitions,
} from '../shared/tariffConfig.js';
import { formatTariffValue } from '../shared/tariffFormat.js';

const IMPORT_COUNTRY_SET = new Set(IMPORT_COUNTRIES);
const EXPORT_COUNTRY_SET = new Set(EXPORT_COUNTRIES);

function normalizeCellValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'object') {
    if ('result' in value && value.result !== undefined) {
      return normalizeCellValue(value.result);
    }

    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join('').trim() || null;
    }

    if ('text' in value) {
      return String(value.text).trim() || null;
    }

    return String(value).trim() || null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  return value;
}

function isMeaningfulValue(value) {
  return !(value === null || value === undefined || value === '');
}

function detectCrossMarked(cell) {
  return Boolean(cell?.border?.diagonal?.up && cell?.border?.diagonal?.down);
}

function findColumnByLabel(worksheet, label) {
  for (let columnIndex = 1; columnIndex <= worksheet.columnCount; columnIndex += 1) {
    const cellValue = normalizeCellValue(worksheet.getRow(5).getCell(columnIndex).value);

    if (cellValue === label) {
      return columnIndex;
    }
  }

  return null;
}

function buildSectionHeaders(worksheet, startColumn, endColumn) {
  const row6 = worksheet.getRow(6);
  const row7 = worksheet.getRow(7);
  const hasCountryRow7 = Array.from({ length: endColumn - startColumn + 1 }, (_, offset) => {
    const columnIndex = startColumn + offset;
    return normalizeCellValue(row7.getCell(columnIndex).value);
  }).some(Boolean);

  let currentContinent = null;
  const headers = [];

  for (let columnIndex = startColumn; columnIndex <= endColumn; columnIndex += 1) {
    const country = normalizeCellValue(
      hasCountryRow7 ? row7.getCell(columnIndex).value : row6.getCell(columnIndex).value,
    );

    if (!country) {
      continue;
    }

    if (hasCountryRow7) {
      const rawContinent = normalizeCellValue(row6.getCell(columnIndex).value);
      if (rawContinent) {
        currentContinent = rawContinent;
      }
    } else {
      currentContinent = EXPORT_COUNTRY_TO_CONTINENT[country] ?? currentContinent;
    }

    headers.push({
      columnIndex,
      country,
      continent: currentContinent ?? EXPORT_COUNTRY_TO_CONTINENT[country] ?? null,
    });
  }

  return headers;
}

function buildHeaderMap(worksheet) {
  const agreementStartColumn = findColumnByLabel(worksheet, '협정관세');
  const originStartColumn = findColumnByLabel(worksheet, '원산지 결정 기준');
  const noteStartColumn = findColumnByLabel(worksheet, '비고') ?? (worksheet.columnCount + 1);

  if (!agreementStartColumn || !originStartColumn) {
    throw new Error(`[${worksheet.name}] 필수 헤더(협정관세/원산지 결정 기준)를 찾지 못했습니다.`);
  }

  const agreementHeaders = buildSectionHeaders(worksheet, agreementStartColumn, originStartColumn - 1)
    .filter((header) => EXPORT_COUNTRY_SET.has(header.country));

  const originHeaders = buildSectionHeaders(worksheet, originStartColumn, noteStartColumn - 1)
    .filter((header) => EXPORT_COUNTRY_SET.has(header.country));

  const originHeadersByCountry = new Map(originHeaders.map((header) => [header.country, header]));

  return {
    agreementHeaders,
    originHeadersByCountry,
  };
}

function hasDataPayload(row, agreementHeaders) {
  const hsCode = normalizeCellValue(row.getCell(3).value);
  const baseTariff = normalizeCellValue(row.getCell(4).value);

  if (isMeaningfulValue(hsCode) || isMeaningfulValue(baseTariff)) {
    return true;
  }

  return agreementHeaders.some((header) =>
    isMeaningfulValue(normalizeCellValue(row.getCell(header.columnIndex).value)),
  );
}

function buildRowExportMap(row, agreementHeaders, originHeadersByCountry, baseTariffRaw) {
  return agreementHeaders.reduce((accumulator, header) => {
    const agreementCell = row.getCell(header.columnIndex);
    const agreementTariffRaw = normalizeCellValue(agreementCell.value);
    const originHeader = originHeadersByCountry.get(header.country);
    const originRuleRaw = originHeader
      ? normalizeCellValue(row.getCell(originHeader.columnIndex).value)
      : null;
    const xMarked = detectCrossMarked(agreementCell);
    const displayTariffRaw = xMarked ? baseTariffRaw : agreementTariffRaw;

    accumulator[header.country] = {
      exportContinent: EXPORT_COUNTRY_TO_CONTINENT[header.country] ?? header.continent,
      agreementTariffRaw,
      agreementTariffDisplay: formatTariffValue(agreementTariffRaw),
      displayTariffRaw,
      displayTariffDisplay: formatTariffValue(displayTariffRaw),
      displaySource: xMarked ? '기본관세' : '협정관세',
      xMarked,
      originRule: originRuleRaw ?? '-',
    };

    return accumulator;
  }, {});
}

function sortRows(rows) {
  return [...rows].sort((left, right) => {
    const leftOrder = IMPORT_COUNTRY_ORDER[left.importCountry] ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = IMPORT_COUNTRY_ORDER[right.importCountry] ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.sourceRowNumber - right.sourceRowNumber;
  });
}

function createDuplicateImportCountryRows(rows) {
  const groups = rows.reduce((accumulator, row) => {
    if (!accumulator[row.importCountry]) {
      accumulator[row.importCountry] = [];
    }

    accumulator[row.importCountry].push(row.sourceRowNumber);
    return accumulator;
  }, {});

  return Object.entries(groups)
    .filter(([, rowNumbers]) => rowNumbers.length > 1)
    .map(([importCountry, rowNumbers]) => ({
      importCountry,
      rows: rowNumbers,
    }))
    .sort((left, right) => {
      const leftOrder = IMPORT_COUNTRY_ORDER[left.importCountry] ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = IMPORT_COUNTRY_ORDER[right.importCountry] ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    });
}

function parseWorksheet(worksheet) {
  const { agreementHeaders, originHeadersByCountry } = buildHeaderMap(worksheet);
  const rows = [];
  let previousImportContinent = null;
  let previousImportCountry = null;
  let blankStreak = 0;

  for (let rowNumber = 8; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);

    if (!hasDataPayload(row, agreementHeaders)) {
      blankStreak += 1;

      if (blankStreak >= 12) {
        break;
      }

      continue;
    }

    blankStreak = 0;

    const rawImportContinent = normalizeCellValue(row.getCell(1).value);
    const rawImportCountry = normalizeCellValue(row.getCell(2).value);

    if (rawImportContinent) {
      previousImportContinent = rawImportContinent;
    }

    if (rawImportCountry) {
      previousImportCountry = rawImportCountry;
    }

    const importCountry = rawImportCountry ?? previousImportCountry;
    const importContinent =
      IMPORT_COUNTRY_TO_CONTINENT[importCountry] ??
      rawImportContinent ??
      previousImportContinent;

    if (!IMPORT_COUNTRY_SET.has(importCountry)) {
      continue;
    }

    const hsCode = normalizeCellValue(row.getCell(3).value);
    const baseTariffRaw = normalizeCellValue(row.getCell(4).value);

    rows.push({
      rowKey: `${getProductId(worksheet.name)}:r${rowNumber}`,
      sourceRowNumber: rowNumber,
      importContinent,
      importCountry,
      hsCode,
      baseTariffRaw,
      baseTariffDisplay: formatTariffValue(baseTariffRaw),
      exports: buildRowExportMap(row, agreementHeaders, originHeadersByCountry, baseTariffRaw),
    });
  }

  const sortedRows = sortRows(rows);
  const availableImportCountries = sortCountries(
    [...new Set(sortedRows.map((row) => row.importCountry))],
    IMPORT_COUNTRY_ORDER,
  ).map((country) => ({
    continent: IMPORT_COUNTRY_TO_CONTINENT[country],
    country,
  }));

  const availableExportCountries = sortCountries(
    agreementHeaders.map((header) => header.country),
    EXPORT_COUNTRY_ORDER,
  ).map((country) => ({
    continent: EXPORT_COUNTRY_TO_CONTINENT[country],
    country,
  }));

  return {
    id: getProductId(worksheet.name),
    sheetName: worksheet.name,
    label: getProductDisplayLabel(worksheet.name),
    availableImportCountries,
    availableExportCountries,
    missingExportCountriesFromRequestedSet: EXPORT_COUNTRIES.filter(
      (country) => !availableExportCountries.some((item) => item.country === country),
    ),
    duplicateImportCountryRows: createDuplicateImportCountryRows(sortedRows),
    rows: sortedRows,
  };
}

export async function parseTariffWorkbook({
  fileBuffer,
  sourceFileName,
  sourceFileLastModified,
  uploadedAt,
}) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const includedWorksheets = workbook.worksheets.filter((worksheet) => isIncludedSheet(worksheet.name));
  const products = {};
  const productDefinitions = [];

  includedWorksheets.forEach((worksheet) => {
    const parsedProduct = parseWorksheet(worksheet);
    products[parsedProduct.id] = parsedProduct;
    productDefinitions.push({
      id: parsedProduct.id,
      label: parsedProduct.label,
      sheetName: parsedProduct.sheetName,
    });
  });

  const sortedProductDefinitions = sortProductDefinitions(productDefinitions);

  return {
    meta: {
      sourceFileName,
      sourceFileLastModified,
      uploadedAt,
      extractedAt: uploadedAt,
      includedSheetCount: includedWorksheets.length,
      includedSheets: includedWorksheets.map((worksheet) => worksheet.name),
      excludedSheetKeywords: EXCLUDED_SHEET_KEYWORDS,
      notes: [
        '협정관세 셀의 X 표시는 셀 값이 아니라 대각선 테두리(X) 스타일입니다.',
        '상세 조회의 표시 관세율은 X 표기 시 기본관세를 우선 표시합니다.',
        '그래프는 협정관세와 기본관세를 함께 비교하며, 국가 카드는 좌우 스크롤 방식으로 조회합니다.',
        '일부 제품/수입국 조합은 동일 국가에 대해 복수 HS Code 행이 존재하며 다건 그대로 유지합니다.',
      ],
    },
    uiConfig: {
      productFieldLabel: PRODUCT_FIELD_LABEL,
      products: sortedProductDefinitions,
      importCountryGroups: IMPORT_COUNTRY_GROUPS,
      exportCountryGroups: EXPORT_COUNTRY_GROUPS,
    },
    products,
  };
}
