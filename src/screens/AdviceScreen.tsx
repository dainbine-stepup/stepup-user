import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Linking,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {adviceData} from '../data/AdviceInfo';
import PeriodSelector from '../components/PeroidSelector';
import {
  getSalesTargetsByType,
  getSalesAmountSumFromHistory,
} from '../database/SalesTargetRepository';
import {getSalesAmountSumByPeriod} from '../database/TargetSalesRespository';
import {useFocusEffect} from '@react-navigation/native';
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
    if (rate < 85) return 'low';
    if (rate < 100) return 'mid';
    return 'high';
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

    const totalTarget = await getSalesAmountSumFromHistory(
      dateRange.start,
      dateRange.end,
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

  // 상담사 연결 버튼 클릭시
  const handleConsulationRequest = () => {
    // 추후 자동 전송으로 변경 가능성 존재
    Alert.alert(
      '상담 요청',
      '상담 담당자에게 문자메시지를 송신하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            // 문자 내용 구성
            const message = `
[맞춤상담 요청]

목표액: ${targetAmount}원
실적액: ${salesAmount}원
달성률: ${achievementRate}%
분석: ${advice.analysis}
조언: ${advice.advice}
          `;

            const phoneNumber = '01067116227';
            const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(
              message,
            )}`;

            Linking.openURL(smsUrl).catch(err =>
              Alert.alert('오류', '문자 앱을 여는 데 실패했습니다.'),
            );
          },
        },
      ],
      {cancelable: true},
    );
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  useFocusEffect(
    useCallback(() => {
      setSelectedPeriod('기간을 선택하세요');
    }, []),
  );
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
                <Text style={styles.sectionTitle}>상담</Text>
                <View style={styles.consulationView}>
                  <Text style={styles.agencyText}>비투스 상담 담당자</Text>
                  <TouchableOpacity
                    style={styles.consulationRequstBtn}
                    onPress={handleConsulationRequest}>
                    <Text style={styles.buttonText}>상담 요청</Text>
                  </TouchableOpacity>
                </View>
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
    marginBottom: 10,
    color: '#222',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
  },
  consulationView: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    alignItems: 'center',
  },
  agencyText: {
    fontSize: 17,
  },

  consulationRequstBtn: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
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
