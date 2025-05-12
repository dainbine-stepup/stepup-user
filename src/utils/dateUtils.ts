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

  const seen: {[key: string]: number} = {}; // key = YYYY-MM, value = week count

  let current = getMonday(new Date(now)); // 오늘이 포함된 주의 월요일

  // 3개월 후 마지막 날짜
  const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);

  while (current <= endDate) {
    const monday = new Date(current);
    const sunday = getSunday(monday);
    const year = monday.getFullYear();
    const month = monday.getMonth(); // 0-indexed
    const key = `${year}-${month}`;

    if (!seen[key]) seen[key] = 1;
    const weekNumber = seen[key]++;

    const range = `${formatDate(monday)} ~ ${formatDate(sunday)}`;

    results.push(`${range}`);

    // 다음 주로 이동
    current.setDate(current.getDate() + 7);
  }

  return results;
}
function formatDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 일요일은 -6, 월요일은 0
  date.setDate(date.getDate() + diff);
  return date;
}

function getSunday(d: Date): Date {
  const monday = getMonday(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}
function formatDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  } else if (type === '주') {
    // 예: "5월 12일 ~ 5월 18일"
    const match = value.match(
      /^(\d{1,2})월\s*(\d{1,2})일\s*~\s*(\d{1,2})월\s*(\d{1,2})일$/,
    );

    if (!match) {
      throw new Error('유효하지 않은 주 형식입니다.');
    }

    const startMonth = parseInt(match[1], 10) - 1; // 0-indexed
    const startDay = parseInt(match[2], 10);
    const endMonth = parseInt(match[3], 10) - 1; // 0-indexed
    const endDay = parseInt(match[4], 10);

    const currentYear = new Date().getFullYear();

    // 시작 날짜와 종료 날짜 계산
    const startDate = new Date(currentYear, startMonth, startDay);
    const endDate = new Date(currentYear, endMonth, endDay);

    // 주 단위로 계산 (월요일 ~ 일요일)
    const monday = getMonday(startDate);
    const sunday = getSunday(endDate);

    return {
      start: formatDay(monday),
      end: formatDay(sunday),
    };
  } else {
    throw new Error('type은 "월" 또는 "주"만 가능합니다.');
  }
}
