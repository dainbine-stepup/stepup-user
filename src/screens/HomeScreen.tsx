import React, {useState, useEffect, useMemo, useCallback } from 'react';
import {ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions}  from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import PeriodSelector from '../components/PeroidSelector'
import SalesOverview from '../components/SalesOverview';
import GraphComponent from '../components/GraphComponent';
import {
  getCurrentPeriodText,
  getCurrentPeriodDateRange,
  getCurrentWeekPeriodText,
  getCurrentWeekDateRange,
  getDateRange,
  groupMonthDataByWeek,
  useSalesOverviewData,
  useGraphData
} from '../utils/useChartData';

function HomeScreen({navigation}: any) {

  // 현재 디바이스 스크린 가로 길이
  const screenWidth = Dimensions.get('window').width;

  // 기간 선택 관련 상태
  const [selected, setSelected] = useState('월');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isGraphReady, setIsGraphReady] = useState<boolean>(true);

  const { salesOverviewData } = useSalesOverviewData(
    selected,
    dateRange,
    selectedPeriod,
  );

  const { graphData, isLoadingData } = useGraphData(
    selected,
    dateRange,
  )

  const isEmptyGraphData = (
    graphData.dataPoints.every(v => v === 0) && graphData.targetPoints.every(v => v === 0)
  );

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
    } else if (selected === '일') {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
      setDateRange({ start: todayStr, end: todayStr });
      setSelectedPeriod(todayStr.replace(/-/g, '-')); // 예: 2025.05.23
    }
  }, [selected])

  // 기간 변경시 작동
  useEffect(() => {

    setIsGraphReady(false);
    if(selectedPeriod === '기간을 선택하세요') {
      const range = getCurrentPeriodDateRange();
      if (selected === '월') {
        const range = getCurrentPeriodDateRange();
        setDateRange(range);
        setSelectedPeriod(getCurrentPeriodText());
      } else if (selected === '주') {
        const range = getCurrentWeekDateRange();
        setDateRange(range);
        setSelectedPeriod(getCurrentWeekPeriodText());
      } else if (selected === '일') {
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        setDateRange({ start: todayStr, end: todayStr });
        setSelectedPeriod(todayStr.replace(/-/g, '-'));
      }
    }

  }, [selectedPeriod]);

  useEffect(() => {
    setIsGraphReady(!isLoadingData);
  }, [isLoadingData]);


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

      <SalesOverview
        salesTarget={salesOverviewData.salesTarget}
        totalAmount={salesOverviewData.totalAmount}
        achievementRate={salesOverviewData.achievementRate}
      />
      
      {/* 그래프 */}
      <View style={styles.graphContainer}>

        <View style={styles.graphTitle}>
          <Text>
            {selected === '월' ? '월' : selected === '주' ? '주' : '최근 7일'} 매출 그래프
          </Text>
        </View>

        {!isGraphReady ? (
          <View style={[styles.loadingChart, { height: screenWidth * 2 / 3 }]}>
            <Text style={styles.loadingText}>차트를 불러오는 중...</Text>
          </View>
        ) : isEmptyGraphData ? (
          <View style={[styles.loadingChart, { height: screenWidth * 2 / 3 }]}>
            <Text style={[styles.loadingText, { color: '#666', fontWeight: 'bold'}]}>데이터가 없습니다</Text>
          </View>
        ) : (
          <GraphComponent
            labels={graphData.labels}
            dataPoints={graphData.dataPoints}
            targetPoints={graphData.targetPoints}
            lineDataPoints={graphData.lineDataPoints}
            height={screenWidth * 2 / 3}
          />
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
