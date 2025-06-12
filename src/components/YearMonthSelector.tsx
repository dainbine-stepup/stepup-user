import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import YearSelectorModal from './YearSelectorModal';
import MonthSelectorModal from './MonthSelectorModal';

interface Props {
    title: string;
    year: string;
    month: string;
    onChangeYear: (newYear: string) => void;
    onChangeMonth: (newMonth: string) => void;
}

function YearMonthSelector({ title, year, month, onChangeYear, onChangeMonth }: Props) {

    // 년/월 모달 표시
    const [yearModalVisible, setYearModalVisible] = useState(false);
    const [monthModalVisible, setMonthModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>{title}</Text>
            </View>
            <View style={styles.yearMonthSelectorContainer}>
            
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setYearModalVisible(true)}
                >
                    <Text style={styles.dateButtonText}>{year}</Text>
                </TouchableOpacity>
                <Text style={styles.dateText}>년</Text>
                
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setMonthModalVisible(true)}
                >    
                    <Text>{month}</Text>
                </TouchableOpacity>
                <Text style={styles.dateText}>월</Text>
            </View>

            {/* year modal */}
            <YearSelectorModal
                visible={yearModalVisible}
                onClose={() => setYearModalVisible(false)}
                onSelect={(selectedYear) => {
                    onChangeYear(selectedYear);
                    setYearModalVisible(false);
                }}
            />

            {/* month modal */}
            <MonthSelectorModal
                visible={monthModalVisible}
                onClose={() => setMonthModalVisible(false)}
                onSelect={(selectedMonth) => {
                    onChangeMonth(selectedMonth);
                    setMonthModalVisible(false);
            }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
    },
    titleContainer: {
        paddingLeft: 10,
    },
    titleText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    yearMonthSelectorContainer: {
        flexDirection: "row",
        gap: 10,
    },
    dateButton: {
        width: 80,
        height: 30,
        borderWidth: 1.5,
        borderColor: "#038CD0",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    dateButtonText: {
        fontSize: 16,
    },
    dateText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#008BF1",
    },
});

export default YearMonthSelector;