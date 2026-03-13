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

export const IMPORT_COUNTRY_GROUPS = [
  { continent: '유럽', countries: ['독일', '스페인', '영국'] },
  { continent: 'CIS', countries: ['러시아'] },
  { continent: '북중미', countries: ['멕시코', '미국', '캐나다'] },
  { continent: '남미', countries: ['브라질', '칠레', '콜롬비아', '파나마', '페루'] },
  { continent: '아시아', countries: ['인도', '인도네시아', '중국', '한국', '호주'] },
  { continent: '중아', countries: ['사우디', '아랍에미리트', '이스라엘', '이집트'] },
];

export const EXPORT_COUNTRY_GROUPS = [
  { continent: '유럽', countries: ['폴란드'] },
  { continent: 'CIS', countries: ['러시아'] },
  { continent: '북중미', countries: ['멕시코'] },
  { continent: '남미', countries: ['브라질'] },
  { continent: '아시아', countries: ['인도', '인도네시아', '중국', '베트남', '한국'] },
  { continent: '중아', countries: ['이집트'] },
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

export function createCountryOrderMap(groups) {
  const orderMap = {};
  let index = 0;

  groups.forEach((group) => {
    group.countries.forEach((country) => {
      orderMap[country] = index;
      index += 1;
    });
  });

  return orderMap;
}

export const IMPORT_COUNTRIES = flattenCountryGroups(IMPORT_COUNTRY_GROUPS);
export const EXPORT_COUNTRIES = flattenCountryGroups(EXPORT_COUNTRY_GROUPS);

export const IMPORT_COUNTRY_TO_CONTINENT = createCountryToContinentMap(IMPORT_COUNTRY_GROUPS);
export const EXPORT_COUNTRY_TO_CONTINENT = createCountryToContinentMap(EXPORT_COUNTRY_GROUPS);

export const IMPORT_COUNTRY_ORDER = createCountryOrderMap(IMPORT_COUNTRY_GROUPS);
export const EXPORT_COUNTRY_ORDER = createCountryOrderMap(EXPORT_COUNTRY_GROUPS);

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
