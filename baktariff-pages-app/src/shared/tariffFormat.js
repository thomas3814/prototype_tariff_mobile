/**
 * 숫자/날짜/표시 텍스트를 일관되게 표현하기 위한 공통 포맷 함수입니다.
 */

export function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function formatTariffValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (isNumber(value)) {
    return `${(value * 100).toFixed(1)}%`;
  }

  return String(value).trim() || '-';
}

export function getNumericTariffValue(value) {
  return isNumber(value) ? value : null;
}

export function formatDateTimeToKorea(value) {
  if (!value) {
    return '-';
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch (error) {
    return '-';
  }
}
