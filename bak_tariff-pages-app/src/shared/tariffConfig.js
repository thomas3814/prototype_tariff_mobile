/**
 * 관세 조견표 프로젝트에서 사용하는 공통 상수 모음입니다.
 * 프론트엔드와 엑셀 파서가 같은 기준을 보도록 한 곳에 모아둡니다.
 */

export const PRODUCT_FIELD_LABEL = '제품';
export const EXCLUDED_SHEET_KEYWORDS = ['이어버드', 'BD Player', '무선스피커 별매용 배터리'];

export const PRODUCT_ID_OVERRIDES = {
  'LCD TV Set(852872)': 'lcd-tv-set-852872',
  'PC(847130)': 'pc-847130',
  'PC 모니터(852852)': 'pc-monitor-852852',
  '사이니지 모니터(852852)': 'signage-monitor-852852',
  '스피커(851822)': 'speaker-851822',
  '사운드바(851822 or 851981)': 'soundbar-851822-851981',
  '프로젝터(852862)': 'projector-852862',
};

export const PRODUCT_DISPLAY_LABELS = {
  'LCD TV Set(852872)': 'LCD TV',
  'PC 모니터(852852)': 'PC 모니터',
  '사이니지 모니터(852852)': '사이니지 모니터',
  'PC(847130)': 'PC',
  '스피커(851822)': '스피커',
  '사운드바(851822 or 851981)': '사운드바',
  '프로젝터(852862)': '프로젝터',
};

export const PRODUCT_DISPLAY_ORDER = [
  'lcd-tv-set-852872',
  'pc-monitor-852852',
  'signage-monitor-852852',
  'pc-847130',
  'speaker-851822',
  'soundbar-851822-851981',
  'projector-852862',
];

export const IMPORT_COUNTRY_GROUPS = [
  { continent: '유럽', countries: ['독일', '스페인', '영국'] },
  { continent: '북중미', countries: ['멕시코', '미국', '캐나다'] },
  { continent: '중아', countries: ['사우디', '아랍에미리트', '이스라엘', '이집트'] },
  { continent: '남미', countries: ['브라질', '칠레', '콜롬비아', '파나마', '페루'] },
  { continent: '아시아', countries: ['인도', '인도네시아', '중국', '한국', '호주'] },
  { continent: 'CIS', countries: ['러시아'] },
];

export const EXPORT_COUNTRY_GROUPS = [
  { continent: '유럽', countries: ['폴란드'] },
  { continent: '북중미', countries: ['멕시코'] },
  { continent: '아시아', countries: ['인도네시아', '중국', '한국', '인도', '베트남'] },
  { continent: '중아', countries: ['이집트'] },
  { continent: '남미', countries: ['브라질'] },
  { continent: 'CIS', countries: ['러시아'] },
];

export const EXPORT_RESULT_COUNTRY_SEQUENCE = [
  '폴란드',
  '멕시코',
  '인도네시아',
  '중국',
  '한국',
  '이집트',
  '인도',
  '브라질',
  '러시아',
  '베트남',
];

export function flattenCountryGroups(groups) {
  return groups.flatMap((group) => group.countries);
}

export function createCountryToContinentMap(groups) {
  return groups.reduce((accumulator, group) => {
    group.countries.forEach((country) => {
      accumulator[country] = group.continent;
    });
    return accumulator;
  }, {});
}

export function createOrderMapFromList(items) {
  return items.reduce((accumulator, item, index) => {
    accumulator[item] = index;
    return accumulator;
  }, {});
}

export function createCountryOrderMap(groups) {
  return createOrderMapFromList(flattenCountryGroups(groups));
}

export const IMPORT_COUNTRIES = flattenCountryGroups(IMPORT_COUNTRY_GROUPS);
export const EXPORT_COUNTRIES = flattenCountryGroups(EXPORT_COUNTRY_GROUPS);

export const IMPORT_COUNTRY_TO_CONTINENT = createCountryToContinentMap(IMPORT_COUNTRY_GROUPS);
export const EXPORT_COUNTRY_TO_CONTINENT = createCountryToContinentMap(EXPORT_COUNTRY_GROUPS);

export const IMPORT_COUNTRY_ORDER = createCountryOrderMap(IMPORT_COUNTRY_GROUPS);
export const EXPORT_COUNTRY_ORDER = createCountryOrderMap(EXPORT_COUNTRY_GROUPS);
export const PRODUCT_DISPLAY_ORDER_MAP = createOrderMapFromList(PRODUCT_DISPLAY_ORDER);
export const EXPORT_RESULT_COUNTRY_ORDER = createOrderMapFromList(EXPORT_RESULT_COUNTRY_SEQUENCE);

export function sortCountries(countries, orderMap) {
  return [...countries].sort((left, right) => {
    const leftOrder = orderMap[left] ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = orderMap[right] ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.localeCompare(right, 'ko');
  });
}

export function sortItemsByConfiguredOrder(items, getOrderKey, orderMap) {
  return [...items].sort((left, right) => {
    const leftOrder = orderMap[getOrderKey(left)] ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = orderMap[getOrderKey(right)] ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return String(getOrderKey(left)).localeCompare(String(getOrderKey(right)), 'ko');
  });
}

export function groupCountriesByContinent(countries, groups, orderMap) {
  const countrySet = new Set(countries);

  return groups
    .map((group) => ({
      continent: group.continent,
      countries: group.countries.filter((country) => countrySet.has(country)),
    }))
    .filter((group) => group.countries.length > 0)
    .map((group) => ({
      ...group,
      countries: sortCountries(group.countries, orderMap),
    }));
}

export function isIncludedSheet(sheetName) {
  return !EXCLUDED_SHEET_KEYWORDS.some((keyword) => sheetName.includes(keyword));
}

export function getProductId(sheetName) {
  if (PRODUCT_ID_OVERRIDES[sheetName]) {
    return PRODUCT_ID_OVERRIDES[sheetName];
  }

  return sheetName
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getProductDisplayLabel(value) {
  if (!value) {
    return value ?? '';
  }

  if (PRODUCT_DISPLAY_LABELS[value]) {
    return PRODUCT_DISPLAY_LABELS[value];
  }

  return String(value).replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export function sortProductDefinitions(items) {
  return sortItemsByConfiguredOrder(items, (item) => item.id, PRODUCT_DISPLAY_ORDER_MAP);
}

export function normalizeBasePath(value) {
  if (!value) {
    return '/';
  }

  const trimmed = value.trim();

  if (trimmed === '/') {
    return '/';
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}
