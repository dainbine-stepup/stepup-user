export function getNext12Months(): string[] {
  const now = new Date();
  const result: string[] = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    result.push(`${year}년 ${month}월`);
  }

  return result;
}

export function getNext12MonthsByWeekWithRange(): string[] {
  const now = new Date();
  const results: string[] = [];

  let current = getMonday(new Date(now)); // 오늘 포함된 주의 월요일
  const endDate = new Date(
    now.getFullYear(),
    now.getMonth() + 12,
    now.getDate(),
  ); // 정확히 12개월 뒤 같은 날짜

  while (current <= endDate) {
    const monday = new Date(current);
    const sunday = getSunday(monday);

    const range = `${formatDateToYYYYMMDD(monday)} ~ ${formatDateToYYYYMMDD(
      sunday,
    )}`;
    results.push(range);

    // 다음 주로 이동
    current.setDate(current.getDate() + 7);
  }

  return results;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 일요일(-6), 월요일(0), ...
  date.setDate(date.getDate() + diff);
  return date;
}

function getSunday(d: Date): Date {
  const monday = getMonday(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

function formatDateToYYYYMMDD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getDateRange(
  type: string,
  value: string,
): {start: string; end: string} {
  if (type === '월') {
    // 예: '2025년 8월'
    const match = value.match(/(\d{4})년\s*(\d{1,2})월/);
    if (!match) {
      throw new Error('유효하지 않은 월 형식입니다.');
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // 다음 달의 0일 = 이전 달의 마지막 날

    return {
      start: formatDateToYYYYMMDD(startDate),
      end: formatDateToYYYYMMDD(endDate),
    };
  } else if (type === '주') {
    // 예: "2025-05-12 ~ 2025-05-18"
    const match = value.match(
      /^(\d{4})-(\d{2})-(\d{2})\s*~\s*(\d{4})-(\d{2})-(\d{2})$/,
    );

    if (!match) {
      throw new Error('유효하지 않은 주 형식입니다.');
    }

    const startYear = parseInt(match[1], 10);
    const startMonth = parseInt(match[2], 10) - 1;
    const startDay = parseInt(match[3], 10);
    const endYear = parseInt(match[4], 10);
    const endMonth = parseInt(match[5], 10) - 1;
    const endDay = parseInt(match[6], 10);

    const startDate = new Date(startYear, startMonth, startDay);
    const endDate = new Date(endYear, endMonth, endDay);

    if (startDate > endDate) {
      throw new Error('시작 날짜는 종료 날짜보다 이전이어야 합니다.');
    }

    const monday = getMonday(startDate);
    const sunday = getSunday(endDate);

    return {
      start: formatDateToYYYYMMDD(monday),
      end: formatDateToYYYYMMDD(sunday),
    };
  } else {
    throw new Error('type은 "월" 또는 "주"만 가능합니다.');
  }
}
