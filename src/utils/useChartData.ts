import { useEffect, useState } from 'react';
import HomeScreenRepository from '../database/HomeScreenRepository';

export interface SalesRecord {
  sales_date: string;
  sales_amount: number;
}

export interface ChartData {
  salesTarget: string;
  totalAmount: number;
  achievementRate: number;
}

export const useChartData = (
  selected: string,
  dateRange: { start: string; end: string },
  selectedPeriod: string,
  fullDates: string[],
) => {
  const [chartData, setChartData] = useState<ChartData>({
    salesTarget: '0',
    totalAmount: 0,
    achievementRate: 0,
  });

  const [graphData, setGraphData] = useState<SalesRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  useEffect(() => {
    if (selectedPeriod === '기간을 선택하세요') return;

    setIsLoadingData(true);
    setGraphData([]);

    const startDate = dateRange.start;
    const endDate = dateRange.end;
    
    let tempTarget: number | null = null;
    let tempAmount: number | null = null;

    const tryUpdateChartData = () => {
      if (tempTarget !== null && tempAmount !== null) {
        const rate = tempTarget > 0 ? parseFloat(((tempAmount / tempTarget) * 100).toFixed(1)) : 0;
        setChartData({
          salesTarget: String(tempTarget),
          totalAmount: tempAmount,
          achievementRate: rate,
        });
        setIsLoadingData(false);
      }
    };

    HomeScreenRepository.getDailySalesByPeriod(
      selected,
      startDate,
      endDate,
      (records: SalesRecord[]) => {
        const filled = fillMissingDates(fullDates, records);
        setGraphData(filled);
        tempAmount = filled.reduce((sum, item) => sum + (item.sales_amount || 0), 0);
        tryUpdateChartData();
      },
      (error: unknown) => {
        console.error('매출 실적 조회 오류:', error);
        setIsLoadingData(false);
      }
    );

    HomeScreenRepository.getSalesTargetByPeriod(
      selected,
      startDate,
      endDate,
      (target: number) => {
        tempTarget = target;
        tryUpdateChartData();
      },
      (error: unknown) => {
        console.error('매출 목표 조회 오류:', error);
      }
    );
  }, [selected, selectedPeriod, dateRange, fullDates]);

  return { chartData, graphData, isLoadingData };
};

export const getCurrentPeriodText = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return `${year}년 ${month}월`;
};

export const getCurrentPeriodDateRange = (): { start: string; end: string } => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const format = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return {
    start: format(startDate),
    end: format(endDate),
  };
};

export const getCurrentWeekPeriodText = (): string => {
  const today = new Date();
  const currentDay = today.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate()}`;
  };

  return `${format(monday)} ~ ${format(sunday)}`;
};

export const getCurrentWeekDateRange = (): { start: string; end: string } => {
  const today = new Date();
  const currentDay = today.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return {
    start: format(monday),
    end: format(sunday),
  };
};

export const getDateRange = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  while (startDate <= endDate) {
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const date = String(startDate.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${date}`);
    startDate.setDate(startDate.getDate() + 1);
  }

  return dates;
};

// 누락된 날짜를 0으로 채우기
export const fillMissingDates = (
  fullDates: string[],
  records: { sales_date: string; sales_amount: number }[]
): { sales_date: string; sales_amount: number }[] => {
  const map = new Map(records.map(r => [r.sales_date, r.sales_amount]));
  return fullDates.map(date => ({
    sales_date: date,
    sales_amount: map.get(date) ?? 0,
  }));
};

// 월 그래프 데이터를 그룹별로 합산 (1~7일, 8~14일)
export const groupMonthDataByWeek = (
  data: { sales_date: string; sales_amount: number }[]
): { label: string; value: number }[] => {
  const groups: { [key: string]: number } = {};

  data.forEach(item => {
    if (!item.sales_date || typeof item.sales_amount !== 'number') return;

    const dateParts = item.sales_date.split('-');
    if (dateParts.length !== 3) return;

    const day = parseInt(dateParts[2], 10); // 'YYYY-MM-DD' → DD
    if (isNaN(day)) return;

    let start = Math.floor((day - 1) / 7) * 7 + 1;
    let end = start + 6;
    if (end > 31) end = 31;

    const label = `${start}~${end}일`;
    groups[label] = (groups[label] || 0) + item.sales_amount;
  });

  return Object.entries(groups)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([label, value]) => ({ label, value }));
};


