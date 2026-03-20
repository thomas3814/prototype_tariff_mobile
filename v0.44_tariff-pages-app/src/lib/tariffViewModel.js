import {
  EXPORT_COUNTRY_GROUPS,
  EXPORT_COUNTRY_ORDER,
  EXPORT_COUNTRY_TO_CONTINENT,
  IMPORT_COUNTRY_GROUPS,
  IMPORT_COUNTRY_ORDER,
  IMPORT_COUNTRY_TO_CONTINENT,
  groupCountriesByContinent,
  sortCountries,
} from '../shared/tariffConfig.js';
import { formatTariffValue, getNumericTariffValue } from '../shared/tariffFormat.js';

/**
 * 현재 화면 상태를 어느 모드로 보여줄지 결정합니다.
 * - idle: 제품도 선택되지 않음
 * - waiting: 제품만 선택됨
 * - graph-by-export: 수입국만 선택됨
 * - graph-by-import: 수출국만 선택됨
 * - detail: 수입국/수출국 모두 선택됨
 */
export function getViewMode(filters) {
  if (!filters.productId) {
    return 'idle';
  }

  if (filters.importCountry && filters.exportCountry) {
    return 'detail';
  }

  if (filters.importCountry && !filters.exportCountry) {
    return 'graph-by-export';
  }

  if (!filters.importCountry && filters.exportCountry) {
    return 'graph-by-import';
  }

  return 'waiting';
}

export function getProduct(snapshot, productId) {
  if (!snapshot || !productId) {
    return null;
  }

  return snapshot.products?.[productId] ?? null;
}

export function getProductOptions(snapshot) {
  return snapshot?.uiConfig?.products ?? [];
}

export function buildImportCountryGroups(product) {
  if (!product) {
    return [];
  }

  const countries = product.availableImportCountries.map((item) => item.country);
  return groupCountriesByContinent(countries, IMPORT_COUNTRY_GROUPS, IMPORT_COUNTRY_ORDER);
}

export function buildExportCountryGroups(product) {
  if (!product) {
    return [];
  }

  const countries = product.availableExportCountries.map((item) => item.country);
  return groupCountriesByContinent(countries, EXPORT_COUNTRY_GROUPS, EXPORT_COUNTRY_ORDER);
}

export function buildDetailCards(product, importCountry, exportCountry) {
  if (!product || !importCountry || !exportCountry) {
    return [];
  }

  return product.rows
    .filter((row) => row.importCountry === importCountry && row.exports?.[exportCountry])
    .map((row) => {
      const exportInfo = row.exports[exportCountry];

      return {
        rowKey: row.rowKey,
        sourceRowNumber: row.sourceRowNumber,
        importContinent: row.importContinent,
        importCountry: row.importCountry,
        exportContinent: exportInfo.exportContinent,
        exportCountry,
        hsCode: row.hsCode,
        baseTariffRaw: row.baseTariffRaw,
        baseTariffDisplay: row.baseTariffDisplay ?? formatTariffValue(row.baseTariffRaw),
        agreementTariffRaw: exportInfo.agreementTariffRaw,
        agreementTariffDisplay:
          exportInfo.agreementTariffDisplay ?? formatTariffValue(exportInfo.agreementTariffRaw),
        displayTariffRaw: exportInfo.displayTariffRaw,
        displayTariffDisplay:
          exportInfo.displayTariffDisplay ?? formatTariffValue(exportInfo.displayTariffRaw),
        displaySource: exportInfo.displaySource,
        xMarked: Boolean(exportInfo.xMarked),
        originRule: exportInfo.originRule ?? '-',
      };
    })
    .sort((left, right) => left.sourceRowNumber - right.sourceRowNumber);
}

function createGraphEntry(row, exportInfo) {
  return {
    rowKey: row.rowKey,
    sourceRowNumber: row.sourceRowNumber,
    hsCode: row.hsCode,
    baseTariffRaw: row.baseTariffRaw,
    baseTariffDisplay: row.baseTariffDisplay ?? formatTariffValue(row.baseTariffRaw),
    agreementTariffRaw: exportInfo.agreementTariffRaw,
    agreementTariffDisplay:
      exportInfo.agreementTariffDisplay ?? formatTariffValue(exportInfo.agreementTariffRaw),
    displayTariffRaw: exportInfo.displayTariffRaw,
    displayTariffDisplay:
      exportInfo.displayTariffDisplay ?? formatTariffValue(exportInfo.displayTariffRaw),
    displaySource: exportInfo.displaySource,
    xMarked: Boolean(exportInfo.xMarked),
    originRule: exportInfo.originRule ?? '-',
  };
}

function createGraphGroupsFromCountries(countryItems, countryToContinent, countryGroups, countryOrderMap) {
  const itemsByContinent = countryItems.reduce((accumulator, item) => {
    const continent = countryToContinent[item.country] ?? item.continent ?? '기타';

    if (!accumulator[continent]) {
      accumulator[continent] = [];
    }

    accumulator[continent].push({ ...item, continent });

    return accumulator;
  }, {});

  return countryGroups
    .map((group) => ({
      continent: group.continent,
      countries: sortCountries(group.countries, countryOrderMap)
        .map((country) => itemsByContinent[group.continent]?.find((item) => item.country === country))
        .filter(Boolean),
    }))
    .filter((group) => group.countries.length > 0);
}

export function buildGraphModel(product, filters) {
  if (!product) {
    return null;
  }

  if (filters.importCountry && !filters.exportCountry) {
    return buildExportGraphModel(product, filters.importCountry);
  }

  if (!filters.importCountry && filters.exportCountry) {
    return buildImportGraphModel(product, filters.exportCountry);
  }

  return null;
}

function buildExportGraphModel(product, importCountry) {
  const matchingRows = product.rows.filter((row) => row.importCountry === importCountry);
  const countryItems = product.availableExportCountries
    .map((countryItem) => {
      const entries = matchingRows
        .filter((row) => row.exports?.[countryItem.country])
        .map((row) => createGraphEntry(row, row.exports[countryItem.country]))
        .sort((left, right) => left.sourceRowNumber - right.sourceRowNumber);

      if (entries.length === 0) {
        return null;
      }

      return {
        country: countryItem.country,
        continent: countryItem.continent,
        entries,
      };
    })
    .filter(Boolean);

  const groups = createGraphGroupsFromCountries(
    countryItems,
    EXPORT_COUNTRY_TO_CONTINENT,
    EXPORT_COUNTRY_GROUPS,
    EXPORT_COUNTRY_ORDER,
  );

  return finalizeGraphModel({
    mode: 'graph-by-export',
    axisTitle: '수출국',
    title: `${product.label} 수입국 ${importCountry} 기준 수출국 비교`,
    fixedCountryLabel: importCountry,
    groups,
  });
}

function buildImportGraphModel(product, exportCountry) {
  const countryItems = product.availableImportCountries
    .map((countryItem) => {
      const entries = product.rows
        .filter((row) => row.importCountry === countryItem.country && row.exports?.[exportCountry])
        .map((row) => createGraphEntry(row, row.exports[exportCountry]))
        .sort((left, right) => left.sourceRowNumber - right.sourceRowNumber);

      if (entries.length === 0) {
        return null;
      }

      return {
        country: countryItem.country,
        continent: countryItem.continent,
        entries,
      };
    })
    .filter(Boolean);

  const groups = createGraphGroupsFromCountries(
    countryItems,
    IMPORT_COUNTRY_TO_CONTINENT,
    IMPORT_COUNTRY_GROUPS,
    IMPORT_COUNTRY_ORDER,
  );

  return finalizeGraphModel({
    mode: 'graph-by-import',
    axisTitle: '수입국',
    title: `${product.label} 수출국 ${exportCountry} 기준 수입국 비교`,
    fixedCountryLabel: exportCountry,
    groups,
  });
}

function finalizeGraphModel(baseModel) {
  const numericValues = [];

  baseModel.groups.forEach((group) => {
    group.countries.forEach((country) => {
      country.entries.forEach((entry) => {
        const agreementNumeric = getNumericTariffValue(entry.agreementTariffRaw);
        const baseNumeric = getNumericTariffValue(entry.baseTariffRaw);

        if (agreementNumeric !== null) {
          numericValues.push(agreementNumeric);
        }

        if (baseNumeric !== null) {
          numericValues.push(baseNumeric);
        }
      });
    });
  });

  return {
    ...baseModel,
    maxNumericValue: Math.max(...numericValues, 0),
  };
}
