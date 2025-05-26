import { useEffect, useState, useRef } from 'react';
import HomeScreenRepository from '../database/HomeScreenRepository';

export interface SalesRecord {
  sales_date: string;
  sales_amount: number;
}

export interface SalesOverviewData {
  salesTarget: string;
  totalAmount: number;
  achievementRate: number;
}

export interface GraphData {
  labels: string[],
  dataPoints: number[],
  targetPoints: number[];
  lineDataPoints?: number[];
}

export const useSalesOverviewData = (
  selected: string,
  dateRange: { start: string; end: string },
  selectedPeriod: string,
) => {
  const [salesOverviewData, setSalesOverviewData] = useState<SalesOverviewData>({
    salesTarget: '0',
    totalAmount: 0,
    achievementRate: 0,
  });

  useEffect(() => {
    if (selectedPeriod === '기간을 선택하세요') return;


    const startDate = dateRange.start;
    const endDate = dateRange.end;

    const fullDates = getDateRange(startDate, endDate);
    
    let tempTarget: number | null = null;
    let tempAmount: number | null = null;

    const tryUpdateChartData = () => {
      if (tempTarget !== null && tempAmount !== null) {
        const rate = tempTarget > 0 ? parseFloat(((tempAmount / tempTarget) * 100).toFixed(1)) : 0;
        setSalesOverviewData({
          salesTarget: String(tempTarget),
          totalAmount: tempAmount,
          achievementRate: rate,
        });        
      }
    };

    HomeScreenRepository.getDailySalesByPeriod(
      selected,
      startDate,
      endDate,
      (records: SalesRecord[]) => {
        const filled = fillMissingDates(fullDates, records);
        tempAmount = filled.reduce((sum, item) => sum + (item.sales_amount || 0), 0);
        tryUpdateChartData();
      },
      (error: unknown) => {
        console.error('매출 실적 조회 오류:', error);
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
  }, [dateRange]);

  return { salesOverviewData };
};

// 그래프 데이터
export const useGraphData = (
  seleted: string,
  dateRange: {start: string, end: string},
) => {
  const [graphData, setGraphData] = useState<GraphData>({
    labels: [],
    dataPoints: [],
    targetPoints: [],
    lineDataPoints: [],
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // 임시 데이터 저장
  const tempTargetRef = useRef<number[] | null>(null);
  const tempRecordRef = useRef<number[] | null>(null);

  useEffect(() => {

    setIsLoadingData(true);
    
    let { start, end } = dateRange;

    const isValidDate = (dateStr: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());

    // 날짜가 유효하지 않으면 처리하지 않음
    if (!isValidDate(start) || !isValidDate(end)) {      
      return;
    }

    // selected가 '일'이면 최근 7일로 start 날짜 재설정
    if (seleted === '일') {
      const endDate = new Date(end);
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6); // 7일 전

      start = startDate.toISOString().slice(0, 10); // 'YYYY-MM-DD' 포맷
      end = endDate.toISOString().slice(0, 10);
    }

    // 날짜 범위 생성
    const fullDates = getDateListFromRange(start, end); // ['2025-05-01', ...]
    const labels = fullDates.map(date => `${new Date(date).getDate()}일`);
    setGraphData(prev => ({ ...prev, labels }));

    
    // 매출 목표, 매출 실적 데이터 준비 되면 달성율 계산
    // => 달성율 계산 끝나면 그래프 데이터 업데이트
    const tryUpdateGraph = () => {

      const tempTarget = tempTargetRef.current;
      const tempRecord = tempRecordRef.current;
      
        // null 또는 비어 있는 배열일 경우 무시
        if (
          tempTarget &&
          tempRecord &&
          tempTarget.length > 0 &&
          tempRecord.length > 0 &&
          tempTarget.length === tempRecord.length
        ) {
          // 날짜별 달성률 계산
          const lineDataPoints = tempRecord.map((value, index) => {
            const target = tempTarget[index];
            return target > 0 ? Math.round((value / target) * 100) : 0;
          });

          setGraphData(prev => ({
            ...prev,
            targetPoints: tempTarget!,
            dataPoints: tempRecord!,
            lineDataPoints,
          }));
          
          setIsLoadingData(false);

        } else {
          // 데이터가 아예 없을 경우 빈 값으로 초기화
          setGraphData(prev => ({
            ...prev,
            targetPoints: tempTarget ?? [],
            dataPoints: tempRecord ?? [],
            lineDataPoints: [],
          }));
        }
    };


    // 목표 조회
    HomeScreenRepository.getTargetByPerioid(
      start,
      end,
      (targetList: number[], targetDates: string[]) => {
        const paddedTarget = mapDataToFullDateRange(fullDates, targetDates, targetList);
        tempTargetRef.current = paddedTarget;
        tryUpdateGraph();
      },
      (error: any) => {
        console.error('목표 조회 오류:', error);
      }
    );

    // 실적 조회
    HomeScreenRepository.getRecordByPeriod(
      start,
      end,
      (recordList: number[], recordDates: string[]) => {
        const paddedRecord = mapDataToFullDateRange(fullDates, recordDates, recordList);
        tempRecordRef.current = paddedRecord;
        tryUpdateGraph();
      },
      (error: any) => {
        console.error('실적 조회 오류:', error);
      }
    );    
    
  }, [dateRange])

  return { graphData, isLoadingData };
}

export const getDateListFromRange = (start: string, end: string): string[] => {
  const result: string[] = [];
  const current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    result.push(`${yyyy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 1);
  }

  return result;
};

export const mapDataToFullDateRange = (
  fullDates: string[],
  dataDates: string[],
  dataValues: number[]
): number[] => {
  return fullDates.map(date => {
    const idx = dataDates.indexOf(date);
    return idx !== -1 ? dataValues[idx] : 0;
  });
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
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
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


