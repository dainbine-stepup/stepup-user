import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  getDateRange,
  getNext12Months,
  getNext12MonthsByWeekWithRange,
} from '../utils/dateUtils';

function PeriodSelector({
  selected,
  dateRange,
  onChangeDate,
  setSelected,
}: {
  selected: string;
  dateRange: {start: string; end: string};
  onChangeDate: (value: {start: string; end: string}) => void;
  setSelected: (value: string) => void;
}) {
  const options = ['월', '주'];

  const [selectedPeriod, setSelectedPeriod] = useState('기간을 선택하세요');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const months = getNext12Months();
  const weeks = getNext12MonthsByWeekWithRange();

  const handleSelect = (label: string) => {
    setSelected(label);
    setSelectedPeriod('기간을 선택하세요');
  };
  const handleSelectDropdown = (label: string) => {
    setSelectedPeriod(label);
    onChangeDate(getDateRange(selected, label));
    setIsDropdownOpen(false); // 드롭다운 닫기
  };

  return (
    <View style={styles.wrapper}>
      {/* 월/주 버튼 */}
      <View style={styles.selectorWrapper}>
        {options.map((label, index) => (
          <View key={label} style={styles.itemWrapper}>
            <TouchableOpacity
              onPress={() => handleSelect(label)}
              style={
                selected === label ? styles.selectedButton : styles.button
              }>
              <Text
                style={[
                  styles.text,
                  selected === label && styles.selectedText,
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
            {index < options.length - 1 && (
              <Text style={styles.separator}>|</Text>
            )}
          </View>
        ))}
      </View>

      {/* 드롭다운 버튼 */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsDropdownOpen(prev => !prev)}>
        <View style={styles.dropdownTextContainer}>
          <Text style={styles.periodText}>{selectedPeriod}</Text>
          <Text style={styles.arrowText}>▼</Text>
        </View>
      </TouchableOpacity>

      {/* 드롭다운 옵션 표시 */}
      {isDropdownOpen && (
        <View style={styles.dropdown}>
          <ScrollView style={styles.scrollArea}>
            {(selected === '월' ? months : weeks).map(option => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => handleSelectDropdown(option)}>
                <Text
                  style={[
                    styles.optionText,
                    option === selected && styles.selectedOptionText,
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingVertical: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectorWrapper: {
    flexDirection: 'row',
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {},
  selectedButton: {
    backgroundColor: '#007BFF',
  },
  text: {
    fontSize: 22,
    color: 'black',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  separator: {
    marginHorizontal: 6,
    color: '#ccc',
    fontSize: 22,
  },
  dropdownButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    width: '50%',
  },
  dropdownTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  periodText: {
    fontSize: 16,
    color: '#333',
  },

  arrowText: {
    fontSize: 16,
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
});

export default PeriodSelector;
