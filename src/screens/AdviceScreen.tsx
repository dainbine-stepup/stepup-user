import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Linking,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {adviceData} from '../data/AdviceInfo';
import PeriodSelector from '../components/PeroidSelector';
import {
  getSalesTargetsByType,
  getTargetAmountByStartDateAndType,
} from '../database/SalesTargetRepository';
import {getSalesAmountSumByPeriod} from '../database/TargetSalesRespository';
const typeCdMap: Record<string, string> = {
  월: 'TYPCD001',
  주: 'TYPCD002',
};

type SalesTarget = {
  sales_target_id: number;
  start_date: string;
  end_date: string;
  target_amount: number;
  type_cd: string;
  status_cd: string;
  reg_dt: string;
  mod_dt: string | null;
};
function AdviceScreen() {
  // 달성율
  const [achievementRate, setAchievementRate] = useState<number>(0.0);

  // 달성률 구간 판단 함수
  const getRange = (rate: number): string => {
    console.log('달성율 파악하도록 하겠다.', rate);
    if (rate <= 30) return 'veryLow';
    if (rate <= 50) return 'low';
    if (rate <= 70) return 'mid';
    if (rate <= 90) return 'high';
    return 'veryHigh';
  };

  // 범위 및 상담 데이터
  const range = getRange(achievementRate);
  const advice = adviceData[range];

  // 기간 선택 관련 상태
  const [selected, setSelected] = useState('월'); // 월/주
  const [selectedPeriod, setSelectedPeriod] = useState('기간을 선택하세요');
  const [dateRange, setDateRange] = useState({start: '', end: ''});
  const [targetAmount, setTargetAmount] = useState<number>();
  const [salesAmount, setSalesAmount] = useState<number>();

  const fetchData = async () => {
    console.log('데이터 불러와라');

    const totalTarget = await getTargetAmountByStartDateAndType(
      dateRange.start,
      typeCdMap[selected],
    );

    if (selected === '월') {
      setTargetAmount(totalTarget);
      console.log('해당 월 목표액은? : ', totalTarget);
    } else {
      setTargetAmount(totalTarget);
      console.log('해당 주 목표액은?', totalTarget);
    }
    const totalSales = await getSalesAmountSumByPeriod(
      dateRange.start,
      dateRange.end,
    );
    setSalesAmount(totalSales);
    if (totalTarget && totalSales) {
      setAchievementRate(Math.round((totalSales / totalTarget) * 1000) / 10);
    } else {
      setAchievementRate(0);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);
  return (
    <ScrollView style={styles.container}>
      {/* 기간 설정 섹션 */}
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

      {/* 사용자 매출 데이터 섹션 */}
      {selectedPeriod !== '기간을 선택하세요' && (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>목표액</Text>
            <Text style={styles.value}>
              {targetAmount ? `${targetAmount.toLocaleString()}원` : '0원'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>실적액</Text>
            <Text style={styles.value}>
              {salesAmount ? `${salesAmount.toLocaleString()}원` : '0원'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rate}>달성률</Text>
            <Text style={styles.rate}>
              {targetAmount ? `${achievementRate}%` : '목표를 설정하세요'}
            </Text>
          </View>
          {targetAmount ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>분석</Text>
                <Text style={styles.paragraph}>{advice.analysis}</Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>조언</Text>
                <Text style={styles.paragraph}>{advice.advice}</Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>추천 상담기관</Text>
                {advice.agencies.map((agency, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.agencyButton}
                    onPress={() => Linking.openURL(agency.url)}>
                    <Text style={styles.agencyText}>• {agency.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginVertical: 30,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  rate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e64545',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#222',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
  },
  agencyButton: {
    paddingVertical: 6,
  },
  agencyText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // 또는 원하는 색
  },
});

export default AdviceScreen;

function setMonthlyData(data: any) {
  throw new Error('Function not implemented.');
}
function setWeeklyData(data: any) {
  throw new Error('Function not implemented.');
}
