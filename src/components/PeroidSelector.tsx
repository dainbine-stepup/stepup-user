import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  getDateRange,
  getNext12Months,
  getNext12MonthsByWeekWithRange,
} from '../utils/dateUtils';

function PeriodSelector({
  selected,
  dateRange,
  selectedPeriod,
  onChangeDate,
  setSelected,
  setSelectedPeriod,
}: {
  selected: string;

  dateRange: {start: string; end: string};
  selectedPeriod: string;
  onChangeDate: (value: {start: string; end: string}) => void;
  setSelected: (value: string) => void;
  setSelectedPeriod: (value: string) => void;
}) {
  const options = ['월', '주'];

  const [isModalVisible, setIsModalVisible] = useState(false);

  const months = getNext12Months();
  const weeks = getNext12MonthsByWeekWithRange();

  const handleSelect = (label: string) => {
    setSelected(label);
    setSelectedPeriod('기간을 선택하세요');
    onChangeDate({start: '', end: ''});
  };

  const handleSelectModalOption = (label: string) => {
    setSelectedPeriod(label);
    onChangeDate(getDateRange(selected, label));
    setIsModalVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* 월/주 버튼 */}
      <View style={styles.selectorWrapper}>
        {options.map(label => (
          <TouchableOpacity
            key={label}
            onPress={() => handleSelect(label)}
            style={[
              styles.button,
              selected === label && styles.selectedButton,
            ]}>
            <Text
              style={[styles.text, selected === label && styles.selectedText]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 모달 열기 버튼 */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsModalVisible(true)}>
        <View style={styles.dropdownTextContainer}>
          <Text style={styles.periodText}>{selectedPeriod}</Text>
        </View>
      </TouchableOpacity>

      {/* 모달 구현 */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <ScrollView style={styles.scrollArea}>
                  {(selected === '월' ? months : weeks).map(option => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectModalOption(option)}>
                      <Text
                        style={[
                          styles.optionText,
                          option === selectedPeriod &&
                            styles.selectedOptionText,
                        ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
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
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  selectorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  selectedButton: {
    backgroundColor: '#007BFF',
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#fff',
  },
  dropdownButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: 220,
  },
  dropdownTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  periodText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },

  dropdown: {
    position: 'absolute',
    top: 50, // 드롭다운이 selectorWrapper 아래에 나타나도록 위치 설정
    right: 0,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    backgroundColor: '#fff',
    zIndex: 1,
    width: '50%',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#555',
  },
  selectedOptionText: {
    color: 'red',
    fontWeight: 'bold',
  },
  scrollArea: {
    maxHeight: 200, // ✅ 스크롤 되는 영역
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    maxHeight: 500,
    padding: 20,
    borderRadius: 10,
  },
});

export default PeriodSelector;
