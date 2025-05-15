import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import SalesRecordRepository from '../database/SalesRecordRepository';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {Calendar} from 'react-native-calendars';

// 판매 기록 데이터 타입 정의
type SalesRecord = {
  sales_date: string;
  sales_amount: number;
};

function SalesRecordScreen() {
  // 매출 실적 추가 기간
  const [insertPeriodType, setInsertPeriodType] = useState<
    'month' | 'week' | 'day'
  >('month');
  const [insertPeriodList, setInsertPeriodList] = useState<string[]>([]);
  const [showInsertPeriodList, setShowInsertPeriodList] =
    useState<boolean>(false);

  // 매출 실적 추가 금액
  const [insertSalesDate, setInsertSalesDate] = useState<string>('');
  const [insertSalesAmount, setInsertSalesAmount] = useState<string>('');

  // 매출 실적 추가 기간 토글 버튼 클릭시 기간 리스트 생성
  useEffect(() => {
    console.log('선택된 기간 타입:', insertPeriodType);

    if (insertPeriodType === 'month') generateMonthList();
    else if (insertPeriodType === 'week') generateWeekList();
  }, [insertPeriodType]);

  // 월 기간 리스트 생성
  const generateMonthList = () => {
    const result: string[] = [];
    const today = new Date();

    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      result.push(`${year}년 ${month}월`);
    }

    setInsertPeriodList(result);
  };

  // 주 기간 리스트 생성
  const generateWeekList = () => {
    const result: string[] = [];
    const today = new Date();

    // 오늘 기준 주 시작(월요일) 계산
    const dayOfWeek = today.getDay(); // 일: 0, 월: 1, ..., 토: 6
    const daysSinceMonday = (dayOfWeek + 6) % 7; // 월요일 = 0
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysSinceMonday);

    for (let i = 0; i < 6; i++) {
      const weekStart = new Date(monday);
      weekStart.setDate(monday.getDate() - 7 * i);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startStr = `${weekStart.getFullYear()}-${String(
        weekStart.getMonth() + 1,
      ).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
      const endStr = `${weekEnd.getFullYear()}-${String(
        weekEnd.getMonth() + 1,
      ).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;

      result.push(`${startStr} ~ ${endStr}`);
    }

    setInsertPeriodList(result);
  };

  // 매출 저장 처리
  const insertSalesRecord = () => {
    if (!insertSalesDate || !insertSalesAmount) {
      Alert.alert('입력 오류', '날짜와 금액을 입력하세요.');
      return;
    }

    if (isNaN(Number(insertSalesAmount))) {
      Alert.alert('입력 오류', '금액은 숫자만 입력하세요.');
      return;
    }

    SalesRecordRepository.insertSalesRecord(
      {
        insertSalesDate,
        insertSalesAmount: Number(insertSalesAmount),
        insertPeriodType,
      },
      () => {
        Alert.alert('저장 완료', '매출이 저장되었습니다.');
        setInsertSalesDate('');
        setInsertSalesAmount('');
        getSalesRecords(recordPeriodType);
      },
      (error: unknown) => {
        Alert.alert('저장 실패', '오류: ' + error);
      },
    );
  };

  // 매출 조회 기간 타입
  const [recordPeriodType, setRecordPeriodType] = useState<
    'month' | 'week' | 'day'
  >('day');

  // 매출 조회 후 데이터 담을 변수
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);

  // 매출 데이터 가져오기
  const getSalesRecords = (type: 'month' | 'week' | 'day') => {
    SalesRecordRepository.getSalesRecord(
      type,
      (records: SalesRecord[]) => {
        setSalesRecords(records);
      },
      (error: unknown) => {
        console.error('매출 조회 오류:', error);
        Alert.alert('조회 실패', '오류: ' + JSON.stringify(error));
      },
    );
  };

  // 매출 관리 페이지 진입시마다 데이터 호출
  useFocusEffect(
    useCallback(() => {
      setInsertSalesAmount('');
      setInsertSalesDate('');
      getSalesRecords(recordPeriodType);
    }, [recordPeriodType]),
  );

  // 매출 체크 리스트 변수
  const [checkedRecords, setCheckedRecords] = useState<string[]>([]);

  // 체크 토글 함수
  const toggleCheck = (date: string) => {
    setCheckedRecords(prev =>
      prev.includes(date) ? prev.filter(i => i !== date) : [...prev, date],
    );
  };

  useEffect(() => {
    console.log('선택된 날짜들:', checkedRecords);
  }, [checkedRecords]);

  // 수정 기능 변수
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateAmount, setUpdateAmount] = useState('');

  const handleUpdate = () => {
    if (checkedRecords.length === 0) {
      Alert.alert('수정 오류', '수정할 항목을 선택하세요.');
      return;
    }
    setUpdateAmount('');
    setShowUpdateModal(true);
  };

  const applyUpdateAmount = () => {
    const amountNum = Number(updateAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('입력 오류', '올바른 금액을 입력하세요.');
      return;
    }

    SalesRecordRepository.updateSalesAmount(
      recordPeriodType,
      amountNum,
      checkedRecords,
      () => {
        Alert.alert('수정 완료', '선택된 항목의 금액이 수정되었습니다.');
        setShowUpdateModal(false);
        setCheckedRecords([]);
        getSalesRecords(recordPeriodType);
      },
      (error: unknown) => {
        Alert.alert('수정 실패', '오류: ' + error);
      },
    );
  };

  const handleDelete = () => {
    if (checkedRecords.length === 0) {
      Alert.alert('삭제 오류', '삭제할 항목을 선택하세요.');
      return;
    }

    Alert.alert('삭제 확인', '선택한 항목을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '확인',
        style: 'destructive',
        onPress: () => {
          SalesRecordRepository.deleteSalesRecords(
            recordPeriodType,
            checkedRecords,
            () => {
              Alert.alert('완료', '선택한 항목이 삭제되었습니다.');
              setCheckedRecords([]);
              getSalesRecords(recordPeriodType);
            },
            (error: unknown) => {
              Alert.alert('삭제 실패', '오류: ' + error);
            },
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 기간 타입 & 기간 선택 */}
      <View style={styles.inputRow}>
        <View style={styles.periodSelector}>
          {['month', 'week', 'day'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.periodButton,
                insertPeriodType === type && styles.periodButtonActive,
              ]}
              onPress={() => {
                setInsertPeriodType(type as 'month' | 'week' | 'day');
                setInsertSalesDate('');
              }}>
              <Text
                style={[
                  styles.periodButtonText,
                  insertPeriodType === type && styles.periodButtonTextActive,
                ]}>
                {type === 'month' ? '월' : type === 'week' ? '주' : '일'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.input}>
          <TouchableOpacity
            style={styles.periodDropdownButton}
            onPress={() => setShowInsertPeriodList(prev => !prev)}>
            <Text style={styles.periodDropdownText}>
              {insertSalesDate ? `${insertSalesDate}` : '기간을 선택하세요'}
            </Text>
          </TouchableOpacity>

          {/* 기간 선택 모달 (조건 분기) */}
          <Modal
            visible={showInsertPeriodList}
            transparent
            animationType="fade">
            <TouchableWithoutFeedback
              onPress={() => setShowInsertPeriodList(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.modalContainer}>
                    {insertPeriodType === 'day' ? (
                      <>
                        <Calendar
                          onDayPress={day => {
                            setInsertSalesDate(day.dateString);
                            setShowInsertPeriodList(false);
                          }}
                          markedDates={{
                            [insertSalesDate]: {
                              selected: true,
                              selectedColor: '#007BFF',
                            },
                          }}
                        />
                      </>
                    ) : (
                      <ScrollView style={styles.scrollView}>
                        {insertPeriodList.map(item => (
                          <TouchableOpacity
                            key={item}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setInsertSalesDate(item);
                              setShowInsertPeriodList(false);
                            }}>
                            <Text
                              style={[
                                styles.periodItem,
                                item === insertSalesDate &&
                                  styles.selectedOptionText,
                              ]}>
                              {item}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}

                    <TouchableOpacity
                      onPress={() => setShowInsertPeriodList(false)}>
                      <Text
                        style={{
                          textAlign: 'center',
                          marginTop: 10,
                          color: 'red',
                        }}>
                        닫기
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </View>

      {/* 매출 금액 입력 */}
      <View style={styles.inputRow}>
        <Text style={styles.inputTitle}>매출 금액</Text>
        <TextInput
          style={styles.input}
          value={insertSalesAmount}
          onChangeText={setInsertSalesAmount}
          keyboardType="numeric"
          placeholder="금액을 입력하세요"
          placeholderTextColor="#000"
        />
      </View>

      {/* 저장 버튼 */}
      <TouchableOpacity style={styles.saveButton} onPress={insertSalesRecord}>
        <Text style={styles.saveButtonText}>추가</Text>
      </TouchableOpacity>

      {/* 매출 조회 기간 설정 */}
      <View style={styles.toggleContainer}>
        {['month', 'week', 'day'].map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.toggleButton,
              recordPeriodType === type && styles.selectedToggleButton,
            ]}
            onPress={() => {
              setCheckedRecords([]);
              setRecordPeriodType(type as 'month' | 'week' | 'day');
              getSalesRecords(type as 'month' | 'week' | 'day');
            }}>
            <Text
              style={[
                styles.periodButtonText,
                recordPeriodType === type && styles.periodButtonTextActive,
              ]}>
              {type === 'month'
                ? '월간 내역'
                : type === 'week'
                ? '주간 내역'
                : '일간 내역'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView>
        {/* 매출 기록 목록 출력 */}
        <View style={styles.tableHeader}>
          <Text
            onPress={() => {
              if (checkedRecords.length === salesRecords.length) {
                setCheckedRecords([]);
              } else {
                setCheckedRecords(
                  salesRecords.map(record => record.sales_date),
                );
              }
            }}
            style={[styles.tableHeaderCell, styles.firstCell]}>
            {checkedRecords.length === salesRecords.length ? '✅' : '⬜'}
          </Text>

          <Text style={styles.tableHeaderCell}>날짜</Text>
          <Text style={styles.tableHeaderCell}>금액</Text>
        </View>

        {salesRecords.map(record => (
          <TouchableOpacity
            key={record.sales_date}
            onPress={() => toggleCheck(record.sales_date)}
            style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.firstCell]}>
              {checkedRecords.includes(record.sales_date) ? '✅' : '⬜'}
            </Text>

            <Text style={[styles.tableCell, {flex: 1}]}>
              {record.sales_date}
            </Text>
            <Text style={[styles.tableCell, {flex: 1}]}>
              {record.sales_amount.toLocaleString()}원
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 하단 고정 수정/삭제 버튼 */}
      {checkedRecords.length > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}>
            <Text style={styles.actionButtonText}>삭제</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleUpdate}>
            <Text style={styles.actionButtonText}>수정</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showUpdateModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowUpdateModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>금액 수정</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="금액을 입력하세요"
                  placeholderTextColor="#000"
                  value={updateAmount}
                  onChangeText={setUpdateAmount}
                />
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.removeButton]}
                    onPress={() => setShowUpdateModal(false)}>
                    <Text style={styles.actionButtonText}>닫기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.updateButton]}
                    onPress={applyUpdateAmount}>
                    <Text style={styles.actionButtonText}>수정</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 10,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 5,
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  periodButtonActive: {
    backgroundColor: '#007BFF',
  },
  periodButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: 220,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  periodDropdownButton: {},
  periodDropdownText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    maxHeight: 500,
    padding: 20,
    borderRadius: 10,
  },
  periodItemContainer: {
    backgroundColor: '#eee',
    zIndex: 100,
    width: 200,
    overflow: 'hidden',
    position: 'absolute',
    top: 42,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  periodItem: {
    fontSize: 16,
    color: '#555',
  },
  selectedOptionText: {
    color: 'red',
    fontWeight: 'bold',
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  firstCell: {
    flex: 0.5,
    textAlign: 'left',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#007BFF',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff', // 배경 흰색
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007BFF',
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'red',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold', // 제목을 굵게
  },
  modalContent: {
    backgroundColor: 'white', // 모달 내부 배경 색
    padding: 20,
    borderRadius: 10, // 모달 테두리 둥글게
    width: '80%', // 모달 너비
    alignItems: 'center', // 모달 내부 요소들 가운데 정렬
    gap: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 5,
  },
  updateInput: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    width: '70%',
    textAlign: 'center',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: 'red',
  },
  updateButton: {
    backgroundColor: '#007BFF',
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  selectedToggleButton: {
    backgroundColor: '#007BFF',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  scrollView: {
    maxHeight: 200,
  },
});

export default SalesRecordScreen;
