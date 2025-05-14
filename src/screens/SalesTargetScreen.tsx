import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import PeroidSelector from '../components/PeroidSelector';
import {
  getSalesTargetsByType,
  insertSalesTarget,
  removeSalesTarget,
  updateTargetAmount,
} from '../database/SalesTargetRepository';
import {useFocusEffect} from '@react-navigation/native';

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

const columns = ['선택', '날짜', '금액'];

const typeCdMap: Record<string, string> = {
  월: 'TYPCD001',
  주: 'TYPCD002',
};

const statusCdMap: Record<string, string> = {
  활성화: 'STTCD001',
  비활성화: 'STTCD002',
};

function SalesTargetScreen() {
  const [monthlyData, setMonthlyData] = useState<SalesTarget[]>([]);
  const [weeklyData, setWeeklyData] = useState<SalesTarget[]>([]);
  const [selected, setSelected] = useState('월');
  const [viewMode, setViewMode] = useState('월');
  const [dateRange, setDateRange] = useState({start: '', end: ''});
  const [amount, setAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('기간을 선택하세요');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updateAmount, setUpdateAmount] = useState('');

  const currentData = viewMode === '월' ? monthlyData : weeklyData;

  const fetchData = async () => {
    const data = await getSalesTargetsByType(typeCdMap[viewMode]);
    if (viewMode === '월') {
      setMonthlyData(data);
    } else {
      setWeeklyData(data);
    }
    setSelectedIds([]); // 데이터 변경 시 선택 초기화
  };

  useFocusEffect(
    useCallback(() => {
      setAmount('');
      setSelectedPeriod('기간을 선택하세요');
      setDateRange({start: '', end: ''});
    }, []),
  ); // 화면 진입하면 매출금액 초기화

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const saveAmount = async () => {
    if (!dateRange.start || !dateRange.end || !amount) {
      Alert.alert('기간과 목표 금액을 설정하십시오');
      return;
    }

    const typeCd = typeCdMap[selected];
    const statusCd = statusCdMap['활성화'];

    try {
      await insertSalesTarget(
        dateRange.start,
        dateRange.end,
        Number(amount),
        typeCd,
        statusCd,
      );
      Alert.alert('저장 완료', '매출 목표가 저장되었습니다');
      setAmount('');
      setSelectedPeriod('기간을 선택하세요');
      setDateRange({start: '', end: ''});

      fetchData();
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE') {
        Alert.alert('해당 기간에 이미 목표액이 존재합니다.');
      }
    }
  };

  const toggleCheckbox = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    const allIds = currentData.map(item => item.sales_target_id);
    if (selectedIds.length === allIds.length) {
      setSelectedIds([]); // 모두 선택되어 있으면 해제
    } else {
      setSelectedIds(allIds); // 모두 선택
    }
  };

  const removeData = async () => {
    selectedIds.forEach(id => removeSalesTarget(id));
    fetchData();
  };

  const updateData = async (amount: string) => {
    selectedIds.forEach(id => updateTargetAmount(id, parseInt(amount, 10)));
    fetchData();
  };

  const handleUpdate = () => {
    if (updateAmount) {
      updateData(updateAmount);
      setIsModalVisible(false);
      Alert.alert('수정 완료 ', '선택된 항목의 금액이 수정되었습니다');
    } else {
    }
  };

  const getContent = (col: string, row: SalesTarget, index: number) => {
    if (index === 0) {
      return (
        <TouchableOpacity onPress={() => toggleCheckbox(row.sales_target_id)}>
          <Text>{selectedIds.includes(row.sales_target_id) ? '✅' : '⬜'}</Text>
        </TouchableOpacity>
      );
    }

    if (col === '날짜') {
      if (viewMode === '월') {
        const date = new Date(row.start_date);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
      } else {
        return `${row.start_date} ~ ${row.end_date}`;
      }
    }

    if (col === '금액') {
      return `${row.target_amount.toLocaleString()}원`;
    }

    return '';
  };

  return (
    <View style={styles.wrapper}>
      <PeroidSelector
        selected={selected}
        setSelected={setSelected}
        dateRange={dateRange}
        onChangeDate={setDateRange}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />

      <View style={styles.container}>
        <Text style={styles.text}>매출목표 금액</Text>
        <TextInput
          style={styles.input}
          placeholder="금액을 입력하세요"
          placeholderTextColor="#000"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.container}>
        <Text style={styles.text}>시작 일자</Text>
        <Text style={styles.text}>{dateRange.start}</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.text}>종료 일자</Text>
        <Text style={styles.text}>{dateRange.end}</Text>
      </View>

      <View style={styles.container}>
        <TouchableOpacity style={styles.saveButton} onPress={saveAmount}>
          <Text style={styles.saveButtonText}>추가</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === '월' && styles.selectedToggleButton,
          ]}
          onPress={() => setViewMode('월')}>
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === '월' && styles.selectedToggleButtonText,
            ]}>
            월간 내역
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === '주' && styles.selectedToggleButton,
          ]}
          onPress={() => setViewMode('주')}>
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === '주' && styles.selectedToggleButtonText,
            ]}>
            주간 내역
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View>
          <View style={[styles.row, styles.header]}>
            {columns.map((col, index) => (
              <TouchableOpacity
                key={col}
                onPress={index === 0 ? toggleAll : undefined}
                style={index === 0 ? styles.firstCell : styles.cell}>
                <Text style={styles.headerCell}>
                  {index === 0
                    ? selectedIds.length === currentData.length &&
                      currentData.length > 0
                      ? '✅'
                      : '⬜'
                    : col}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {currentData.map(row => (
            <TouchableOpacity
              key={row.sales_target_id}
              style={styles.row}
              onPress={() => toggleCheckbox(row.sales_target_id)}>
              {columns.map((col, index) => (
                <Text
                  key={col}
                  style={index === 0 ? styles.firstCell : styles.cell}>
                  {getContent(col, row, index)}
                </Text>
              ))}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedIds.length > 0 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.removeButton]}
            onPress={removeData}>
            <Text style={styles.buttonText}>삭제</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              setIsModalVisible(true);
              setUpdateAmount('');
            }}>
            <Text style={styles.buttonText}>수정</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={isModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>금액 수정</Text>
                <TextInput
                  style={styles.updateInput}
                  keyboardType="numeric"
                  placeholder="금액을 입력하세요"
                  placeholderTextColor="#000"
                  value={updateAmount}
                  onChangeText={setUpdateAmount}
                />
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.removeButton]}
                    onPress={() => {
                      setIsModalVisible(false);
                    }}>
                    <Text style={styles.buttonText}>닫기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleUpdate}>
                    <Text style={styles.buttonText}>수정</Text>
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
  wrapper: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
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
  saveButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  header: {
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    flex: 1,
    padding: 10,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    textAlign: 'center',
  },
  firstCell: {
    flex: 0.1,
    padding: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 10,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  selectedToggleButton: {
    backgroundColor: '#007BFF',
  },
  toggleButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  selectedToggleButtonText: {
    color: '#fff',
  },
  selectAllButton: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    padding: 8,
  },
  selectAllText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  updateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: 220,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007BFF',
  },
  removeButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SalesTargetScreen;
