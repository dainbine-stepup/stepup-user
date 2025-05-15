import React, {useState, useEffect, useMemo, useCallback } from 'react';
import {ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions}  from 'react-native';
import HomeScreenRepository from '../database/HomeScreenRepository';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import PeriodSelector from '../components/PeroidSelector'
import ChartData from '../components/ChartData';
import {
  getCurrentPeriodText,
  getCurrentPeriodDateRange,
  getCurrentWeekPeriodText,
  getCurrentWeekDateRange,
  getDateRange,
  groupMonthDataByWeek,
  useChartData
} from '../utils/useChartData';

function HomeScreen({navigation}: any) {

  // 기간 선택 관련 상태
  const [selected, setSelected] = useState('월');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isGraphReady, setIsGraphReady] = useState<boolean>(true);

  const fullDates = useMemo(() => getDateRange(dateRange.start, dateRange.end), [dateRange]);
  
  const { chartData, graphData, isLoadingData } = useChartData(
    selected,
    dateRange,
    selectedPeriod,
    fullDates,
  );

  // 그래프 막대 그래프 데이터
  const barData = useMemo(() => {
    if (selected === '주') {
      return graphData.map(item => ({
        value: item.sales_amount,
        label: item.sales_date.slice(-2) + '일',
      }));
    } else if (selected === '월') {
      return groupMonthDataByWeek(graphData);
    }
    return [];
  }, [graphData]);

  // 현재 페이지 진입시마다 새로고침 (현재 날짜 기준 월 데이터로)
  useFocusEffect(
    useCallback(() => {
      const range = getCurrentPeriodDateRange();
      setDateRange(range);
      setSelected('월');
      setSelectedPeriod(getCurrentPeriodText());
    }, [])
  );

  // 기간 타입 변경 시
  useEffect(() => {
    setIsGraphReady(false);
    if (selected === '월') {
      const range = getCurrentPeriodDateRange();
      setDateRange(range);
      setSelectedPeriod(getCurrentPeriodText());
    } else if (selected === '주') {
      const range = getCurrentWeekDateRange();
      setDateRange(range);
      setSelectedPeriod(getCurrentWeekPeriodText());
    }
  }, [selected])

  // 기간 변경시 작동
  useEffect(() => {

    setIsGraphReady(false);
    if(selectedPeriod === '기간을 선택하세요') {
      if (selected === '월') {
        const range = getCurrentPeriodDateRange();
        setDateRange(range);
        setSelectedPeriod(getCurrentPeriodText());
      } else if (selected === '주') {
        const range = getCurrentWeekDateRange();
        setDateRange(range);
        setSelectedPeriod(getCurrentWeekPeriodText());
      }
    }

  }, [selectedPeriod]);

  useEffect(() => {
    setIsGraphReady(!isLoadingData);
  }, [isLoadingData]);

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
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }} style={styles.container}>
      
      <View>
        <PeriodSelector
            selected={selected}
            selectedPeriod={selectedPeriod}
            dateRange={dateRange}
            setSelected={setSelected}
            setSelectedPeriod={setSelectedPeriod}
            onChangeDate={setDateRange}
        />
      </View>

      <ChartData
        salesTarget={chartData.salesTarget}
        totalAmount={chartData.totalAmount}
        achievementRate={chartData.achievementRate}
      />
      
      {/* 그래프 */}
      <View style={styles.graphContainer}>
        {!isGraphReady || barData.length === 0 ? (
          <View style={[styles.loadingChart]}>
            <Text style={styles.loadingText}>차트를 불러오는 중...</Text>
          </View>
        ) : (
          <>
            <View style={styles.graphTitle}>
              <Text style={{ fontSize: 16 }}>매출 그래프</Text>
              <Text style={{ fontSize: 10 }}>(단위: 천원)</Text>
            </View>
            {selected === '월' ? (
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
                yAxisLabelTexts={generateYAxisLabels(graphData)}
              />
            )}
          </>
        )}
      </View>

      {/* 매출 목표 관리 이동 */}
      <View style={styles.row}>
          <Text style={styles.label}>매출 목표 관리</Text>
          <TouchableOpacity style={styles.moveButton} onPress={() => navigation.navigate('SalesTarget')}>
            <Text style={styles.moveButtonText}>이동</Text>  
          </TouchableOpacity>
      </View>

      {/* 매출 실적 관리 이동 */}
      <View style={styles.row}>
          <Text style={styles.label}>매출 실적 관리</Text>
          <TouchableOpacity style={styles.moveButton} onPress={() => navigation.navigate('SalesRecord')}>
            <Text style={styles.moveButtonText}>이동</Text>  
          </TouchableOpacity>
      </View>

      {/* 맞춤 상담 이동 */}
      <View style={styles.row}>
          <Text style={styles.label}>맞춤 상담 관리</Text>
          <TouchableOpacity style={styles.moveButton} onPress={() => navigation.navigate('Advice')}>
            <Text style={styles.moveButtonText}>이동</Text>  
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
    marginTop: 15,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  loadingChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 20,
    color: '#888',
  },
  graphContainer: {
    flex: 1,
    marginVertical: 10,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  graphTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  moveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  moveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
})

export default HomeScreen;
