import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import PeroidSelector from '../components/PeroidSelector';
import {
  getSalesTargetsByType,
  insertSalesTarget,
  removeSalesTarget,
  updateTargetAmount,
} from '../database/SalesTargetRepository';
import CheckBox from '@react-native-community/checkbox';

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

const monthColumns = ['', '날짜', '목표액'];
const weekColumns = ['', '시작일', '종료일', '목표액'];

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

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태 관리

  const [updateAmount, setUpdateAmount] = useState('');
  const changeViewMode = (label: string) => {
    setViewMode(label);
    setSelectedIds([]);
  };
  const toggleCheckbox = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const handleUpdate = () => {
    // 업데이트 로직 추가
    if (updateAmount) {
      // 예: 데이터 업데이트 함수 호출
      console.log('수정된 목표:', updateAmount);
      updateData(updateAmount);
    }
    setIsModalVisible(false); // 수정 후 모달 닫기
  };
  const fetchData = async () => {
    const data = await getSalesTargetsByType(typeCdMap[viewMode]);
    console.log('보여줘', data);
    if (viewMode === '월') {
      setMonthlyData(data);
    } else {
      setWeeklyData(data);
    }
  };

  const removeData = async () => {
    selectedIds.map(id => {
      removeSalesTarget(id);
    });
    fetchData();
    console.log('삭제 했니?');
  };

  const updateData = async (amount: string) => {
    selectedIds.map(id => {
      updateTargetAmount(id, parseInt(amount, 10));
    });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const saveAmount = async () => {
    if (!dateRange.start || !dateRange.end || !amount) {
      console.log('필수 정보 누락');
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
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE') {
        Alert.alert('해당 기간에 이미 목표액이 존재합니다.');
      }
    }

    fetchData();
  };

  const getContent = (col: string, row: SalesTarget, index: number) => {
    if (index === 0) {
      return (
        <TouchableOpacity onPress={() => toggleCheckbox(row.sales_target_id)}>
          <Text>{selectedIds.includes(row.sales_target_id) ? '✅' : '⬜'}</Text>
        </TouchableOpacity>
      );
    }

    if (viewMode === '월') {
      if (col === '날짜') {
        const date = new Date(row.start_date);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
      }
      if (col === '목표액') {
        return `${row.target_amount.toLocaleString()}원`;
      }
    } else {
      if (col === '시작일') return row.start_date;
      if (col === '종료일') return row.end_date;
      if (col === '목표액') return `${row.target_amount.toLocaleString()}원`;
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <PeroidSelector
          selected={selected}
          setSelected={setSelected}
          dateRange={dateRange}
          onChangeDate={setDateRange}
        />
      </View>

      <View style={styles.container}>
        <Text style={styles.text}>매출목표 금액</Text>
        <TextInput
          style={styles.input}
          placeholder="금액을 입력하세요"
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
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === '월' && styles.selectedToggleButton,
          ]}
          onPress={() => changeViewMode('월')}>
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
          onPress={() => changeViewMode('주')}>
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === '주' && styles.selectedToggleButtonText,
            ]}>
            주간 내역
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{marginBottom: 12}}>
        <View>
          <View style={[styles.row, styles.header]}>
            {(viewMode === '월' ? monthColumns : weekColumns).map(
              (col, index) => (
                <Text
                  key={col}
                  style={[
                    index === 0 ? styles.firstCell : styles.cell,
                    styles.headerCell,
                  ]}>
                  {col}
                </Text>
              ),
            )}
          </View>

          {(viewMode === '월' ? monthlyData : weeklyData).map(row => (
            <TouchableOpacity
              key={row.sales_target_id}
              style={styles.row}
              onPress={() => toggleCheckbox(row.sales_target_id)}>
              {(viewMode === '월' ? monthColumns : weekColumns).map(
                (col, index) => (
                  <Text
                    key={col}
                    style={index === 0 ? styles.firstCell : styles.cell}>
                    {getContent(col, row, index)}
                  </Text>
                ),
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.removeButton]}
          onPress={removeData}>
          <Text style={[styles.buttonText, styles.removeText]}>삭제</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setIsModalVisible(!isModalVisible)}>
          <Text style={[styles.buttonText, styles.primaryText]}>수정</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={isModalVisible && selectedIds.length > 0}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>목표 수정</Text>

            <TextInput
              style={styles.updateInput}
              keyboardType="numeric"
              placeholder="목표금액을 설정하세요"
              value={updateAmount}
              onChangeText={value => {
                setUpdateAmount(value);
              }}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.removeButton]}
                onPress={() => setIsModalVisible(false)}>
                <Text style={[styles.buttonText, styles.removeText]}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleUpdate}>
                <Text style={[styles.buttonText, styles.primaryText]}>
                  수정 완료
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 12,
  },
  text: {
    fontSize: 22,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    width: '50%',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
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
    borderColor: '#ccc',
  },
  header: {
    backgroundColor: '#f0f0f0',
  },
  cell: {
    flex: 1,
    padding: 10,
    minWidth: 100,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  firstCell: {
    padding: 10,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 5,
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
  primaryButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  primaryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  removeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    fontSize: 16,
    color: '#000',
  },
  selectedToggleButtonText: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 모달 배경을 어둡게 만들어줍니다.
  },
  modalContent: {
    backgroundColor: 'white', // 모달 내부 배경 색
    padding: 20,
    borderRadius: 10, // 모달 테두리 둥글게
    width: '80%', // 모달 너비
    alignItems: 'center', // 모달 내부 요소들 가운데 정렬
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold', // 제목을 굵게
    marginBottom: 20, // 제목과 입력 필드 간 간격
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
});

export default SalesTargetScreen;
