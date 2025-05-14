import React, {useState, useEffect, useMemo, useCallback } from 'react';
import {ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions}  from 'react-native';
import HomeScreenRepository from '../database/HomeScreenRepository';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-gifted-charts';

function HomeScreen({navigation}: any) {
  
  // 날짜 변수
  const [periodType, setPeriodType] = useState<'month' | 'week'>('month');
  const [refreshKey, setRefreshKey] = useState(0); // 차트 새로고침용

  // 날짜 포맷
  const getCurrentPeriod = (type: 'month' | 'week') => {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');

    if (type === 'month') return `${year}-${month}`;
    if (type === 'week') {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
      const lastDay = new Date(today.setDate(firstDay.getDate() + 6));
      const firstStr = `${firstDay.getFullYear()}-${(firstDay.getMonth() + 1).toString().padStart(2, '0')}-${firstDay.getDate().toString().padStart(2, '0')}`;
      const lastStr = `${lastDay.getFullYear()}-${(lastDay.getMonth() + 1).toString().padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`;
      return `${firstStr} ~ ${lastStr}`;
    }
    return '';
  };

  // 사용자가 고른 기간 문자열(기본값: 현재)
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod('month')); 

  // 매출 목표 실적 달성율 데이터
  const [chartData, setChartData] = useState({
    salesTarget: '0',
    totalAmount: 0,
    achievementRate: 0,
  });

  // 그래프에 사용할 월, 주 데이터
  const [monthData, setMonthData] = useState<{ sales_date: string, sales_amount: number }[]>([]);
  const [weekData, setWeekData] = useState<{ sales_date: string, sales_amount: number }[]>([]);
  
  // 그래프 로딩
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);

  // 그래프 로딩 변수
  const isGraphReady =
    !isLoadingGraph &&
    ((periodType === 'month' && monthData.length > 0) ||
    (periodType === 'week' && weekData.length > 0));

  // 월 그래프 데이터를 그룹별로 합산 (1~7일, 8~14일)
  const groupMonthDataByWeek = (
    data: { sales_date: string; sales_amount: number }[]
  ): { label: string; value: number }[] => {
    const groups: { [key: string]: number } = {};

    data.forEach(item => {
      if (!item.sales_date || typeof item.sales_amount !== 'number') return;

      const dateParts = item.sales_date.split('-');
      if (dateParts.length !== 3) return;

      const day = parseInt(dateParts[2], 10); // 'YYYY-MM-DD' → DD만 추출
      if (isNaN(day)) return;

      let start = Math.floor((day - 1) / 7) * 7 + 1;
      let end = start + 6;
      if (end > 31) end = 31;

      const label = `${start}~${end}일`;
      groups[label] = (groups[label] || 0) + item.sales_amount;
    });

    // 정렬된 순서로 반환
    return Object.entries(groups)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([label, value]) => ({ label, value }));
  };
  
  // 그래프 막대 그래프 데이터
  const barData = useMemo(() => {
    if (periodType === 'week') {
      return weekData.map(item => ({
        value: item.sales_amount,
        label: item.sales_date.slice(-2) + '일',
      }));
    } else if (periodType === 'month') {
      return groupMonthDataByWeek(monthData);
    }
    return [];
  }, [periodType, weekData, monthData]);

  // 현재 디바이스 스크린 가로 길이로 그래프 너비 계산
  const screenWidth = Dimensions.get('window').width;
  const totalWidth = screenWidth - 120; // 좌우 패딩 합쳐서 40 기준

  // 막대 수
  const barCount = barData.length; 

  // 월 / 주 데이터 구분
  const isWeekly = (barCount === 7); // 주차트면 7개 고정

  // 여유공간 포함 비율 설정
  const barWidthRatio = isWeekly ? 0.3 : 0.8;
  const barWidth = totalWidth / (barCount * (1 + barWidthRatio));
  const spacing = barWidth * barWidthRatio;  

  // 기간 타입 변경될 때
  useEffect(() => {
    console.log('설정 기간 타입 변경')
    // 데이터 초기화
    setMonthData([]);
    setWeekData([]);
    // 그래프 로딩
    setIsLoadingGraph(true);

    // 로컬 변수로 임시 저장
    let tempTarget: number | null = null;
    let tempAmount: number | null = null;

    const period = getCurrentPeriod(periodType);
    const fullDates = getDateRange(periodType, period);

    const tryUpdateChartData = () => {
      if (tempTarget !== null && tempAmount !== null) {
        const rate = tempTarget > 0 ? parseFloat(((tempAmount / tempTarget) * 100).toFixed(1)) : 0;
        setChartData({
          salesTarget: String(tempTarget),
          totalAmount: tempAmount,
          achievementRate: rate,
        });
        setIsLoadingGraph(false);
      }
    };

    // 현재 시간 기준 기간으로 변경
    setSelectedPeriod(period);

    // 일별 매출 조회
    HomeScreenRepository.getDailySalesByPeriod(
      periodType,
      period,
      (records: { sales_date: string, sales_amount: number }[]) => {
        const filled = fillMissingDates(fullDates, records);
        if (periodType === 'month') {
          setMonthData(filled);
        } else if (periodType === 'week') {
          setWeekData(filled);
        }
        tempAmount = filled.reduce((sum, item) => sum + (item.sales_amount || 0), 0);
        tryUpdateChartData();
        setIsLoadingGraph(false);
      },
      (error: unknown) => {
        console.error(error);
        setIsLoadingGraph(false);
      },
    );

    // 매출 목표 조회
    HomeScreenRepository.getSalesTargetByPeriod(
      periodType,
      period,
      (target: number) => {
        tempTarget = target;
        tryUpdateChartData();
      },
      (error: unknown) => console.error(error)
    );

  }, [periodType]);

  // 설정 기간 변경 시
  useEffect(() => {
    console.log('설정 기간 변경')
    // 데이터 초기화
    setMonthData([]);
    setWeekData([]);
    // 그래프 로딩
    setIsLoadingGraph(true);

    // 로컬 변수로 임시 저장
    let tempTarget: number | null = null;
    let tempAmount: number | null = null;

    const period = selectedPeriod;
    const fullDates = getDateRange(periodType, period);

    const tryUpdateChartData = () => {
      if (tempTarget !== null && tempAmount !== null) {
        const rate = tempTarget > 0 ? parseFloat(((tempAmount / tempTarget) * 100).toFixed(1)) : 0;
        setChartData({
          salesTarget: String(tempTarget),
          totalAmount: tempAmount,
          achievementRate: rate,
        });
        setIsLoadingGraph(false);
      }
    };

    // 일별 매출 조회
    HomeScreenRepository.getDailySalesByPeriod(
      periodType,
      period,
      (records: { sales_date: string, sales_amount: number }[]) => {
        const filled = fillMissingDates(fullDates, records);
        if (periodType === 'month') {
          setMonthData(filled);
        } else if (periodType === 'week') {
          setWeekData(filled);
        }
        tempAmount = filled.reduce((sum, item) => sum + (item.sales_amount || 0), 0);
        tryUpdateChartData();
        setIsLoadingGraph(false);
      },
      (error: unknown) => {
        console.error(error);
        setIsLoadingGraph(false);
      },
    );

    // 매출 목표 조회
    HomeScreenRepository.getSalesTargetByPeriod(
      periodType,
      period,
      (target: number) => {
        tempTarget = target;
        tryUpdateChartData();
      },
      (error: unknown) => console.error(error)
    );

  }, [selectedPeriod, refreshKey])

  // 현재 페이지 진입시마다 새로고침
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // 해당 기간 전체 날짜 계산(데이터가 없는 날짜도 계산)
  const getDateRange = (periodType: 'month' | 'week', periodValue: string): string[] => {
    const dates: string[] = [];

    if (periodType === 'month') {
      const [year, month] = periodValue.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate(); // 0번째 일은 전 달 마지막 날

      for (let d = 1; d <= lastDay; d++) {
        dates.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      }
    } else if (periodType === 'week') {
      const [startStr] = periodValue.split(' ~ ');
      const startDate = new Date(startStr);

      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      }
    }

    return dates;
  };

  // 데이터가 없는 날짜도 금액 0으로 생성
  const fillMissingDates = (
    fullDates: string[],
    records: { sales_date: string; sales_amount: number }[]
  ): { sales_date: string; sales_amount: number }[] => {
    const map = new Map(records.map(r => [r.sales_date, r.sales_amount]));
    return fullDates.map(date => ({
      sales_date: date,
      sales_amount: map.get(date) ?? 0,
    }));
  };

  // 그래프 y축 라벨
  const generateYAxisLabels = (
    data: { sales_amount: number }[]
  ): string[] => {
    if (data.length === 0) return ['0'];

    const max = Math.max(...data.map(d => d.sales_amount));
    const step = Math.ceil(max / 10);

    return Array.from({ length: 11 }, (_, i) =>
      Math.round((i * step) / 1000).toLocaleString()
    );
  };  

  return (
    <ScrollView style={styles.container}>
      
      {/* 기간 설정 */}
      <View style={styles.row}>
        {/* 월/주 버튼 */}
        <View style={styles.periodTypeSelector}>
            {['month', 'week'].map((type) => (
                <TouchableOpacity
                    key={type}
                    style={[
                        styles.periodTypeButton,
                        periodType === type && styles.periodTypeButtonActive,
                    ]}
                    onPress={() => {
                        const newType = type as 'month' | 'week';
                        setPeriodType(newType);
                        setSelectedPeriod(getCurrentPeriod(newType));
                        setRefreshKey(prev => prev + 1);
                    }}
                >
                    <Text
                        style={[
                            styles.periodTypeButtonText,
                            periodType === type && styles.periodTypeButtonTextActive
                        ]}
                    >
                        {type === 'month' ? '월' : '주'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
        {/* 현재 선택된 기간 */}
        <View style={styles.period}>
          <Text>{selectedPeriod}</Text>
        </View>
      </View>

      
      <View style={styles.periodList}>
        {periodType === 'month' ? (
          <>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === '2025-05' && styles.periodButtonActive,
              ]}
              onPress={() => {
                setSelectedPeriod('2025-05');
                setRefreshKey(prev => prev + 1);
              }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === '2025-05' && styles.periodButtonTextActive,
                ]}
              >
                2025-05
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === '2025-04' && styles.periodButtonActive,
              ]}
              onPress={() => {
                setSelectedPeriod('2025-04');
                setRefreshKey(prev => prev + 1);
              }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === '2025-04' && styles.periodButtonTextActive,
                ]}
              >
                2025-04
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === '2025-05-12 ~ 2025-05-18' && styles.periodButtonActive,
              ]}
              onPress={() => {
                setSelectedPeriod('2025-05-12 ~ 2025-05-18');
                setRefreshKey(prev => prev + 1);
              }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === '2025-05-12 ~ 2025-05-18' && styles.periodButtonTextActive,
                ]}
              >
                이번 주
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === '2025-05-05 ~ 2025-05-11' && styles.periodButtonActive,
              ]}
              onPress={() => {
                setSelectedPeriod('2025-05-05 ~ 2025-05-11');
                setRefreshKey(prev => prev + 1);
              }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === '2025-05-05 ~ 2025-05-11' && styles.periodButtonTextActive,
                ]}
              >
                저번 주
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 매출 목표 */}
      <View style={styles.row}>
        <Text>매출 목표</Text>      
        <Text>{parseInt(chartData.salesTarget).toLocaleString()}원</Text>
      </View>

      {/* 매출 실적 */}
      <View style={styles.row}>
        <Text>매출 실적</Text>      
        <Text>{chartData.totalAmount.toLocaleString()}원</Text>
      </View>

      {/* 달성율 */}
      <View style={styles.row}>
        <Text>달성율</Text>      
        <Text>{chartData.achievementRate.toFixed(1)}%</Text>
      </View>
      
      {/* 그래프 */}
      <View style={styles.graphContainer}>
        {!isGraphReady ? (
          <Text>차트를 불러오는 중...</Text>
        ) : (
          <>
            <Text style={{ marginBottom: 3 }}>그래프</Text>
            <Text style={{ marginBottom: 10, fontSize: 10 }}>(단위: 천원)</Text>
            {periodType === 'month' ? (
              <BarChart
                data={barData}
                frontColor={'#007BFF'}
                width={totalWidth}
                barWidth={barWidth}
                spacing={spacing}
                initialSpacing={10}
                barBorderRadius={4}
                yAxisThickness={0}
                xAxisThickness={0}
                xAxisLabelTextStyle={{ fontSize: 10 }}
                yAxisTextStyle={{ fontSize: 10 }}
                yAxisLabelTexts={generateYAxisLabels(barData.map(d => ({ sales_amount: d.value }))
                )}
              />
            ) : (
              <BarChart
                data={barData}
                frontColor={'#007BFF'}
                width={totalWidth}
                barWidth={barWidth}
                spacing={spacing}
                barBorderRadius={4}
                yAxisThickness={0}
                xAxisThickness={0}
                xAxisLabelTextStyle={{ fontSize: 10 }}
                yAxisTextStyle={{ fontSize: 12 }}
                yAxisLabelTexts={generateYAxisLabels(weekData)}
              />
            )}
          </>
        )}
      </View>

      {/* 매출 목표 관리 이동 */}
      <View style={styles.row}>
          <Text>매출 목표 관리</Text>
          <TouchableOpacity style={styles.moveButton} onPress={() => navigation.navigate('SalesTarget')}>
            <Text>이동</Text>  
          </TouchableOpacity>
      </View>

      {/* 매출 실적 관리 이동 */}
      <View style={styles.row}>
          <Text>매출 실적 관리</Text>
          <TouchableOpacity style={styles.moveButton} onPress={() => navigation.navigate('SalesRecord')}>
            <Text>이동</Text>  
          </TouchableOpacity>
      </View>

      {/* 맞춤 상담 이동 */}
      <View style={styles.row}>
          <Text>맞춤 상담 관리</Text>
          <TouchableOpacity style={styles.moveButton} onPress={() => navigation.navigate('Advise')}>
            <Text>이동</Text>  
          </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  periodTypeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  periodTypeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ccc',
  },
  periodTypeButtonActive: {
    backgroundColor: '#007BFF',
  },
  periodTypeButtonText: {

  },
  periodTypeButtonTextActive: {
    fontWeight: 'bold',
  },
  period: {

  },
  periodList: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#007BFF',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#333',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  graphContainer: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 20,
  },
  moveButton: {
    
  },
  
})

export default HomeScreen;
