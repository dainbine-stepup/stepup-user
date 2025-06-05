import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// DB
import { getAllSales } from "../database/SalesRepository";

// 컴포넌트
import YearSelectorModal from "./YearSelectorModal";

interface SalesRecordsProps {
  refresh: boolean; // 매출 현황 새로고침
  initialYear: string; // 현재 시간(년)
}

function SalesRecords({ refresh, initialYear }: SalesRecordsProps) {
    
    const [salesData, setSalesData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 년도 선택 모달 표시
    const [yearModalVisible, setYearModalVisible] = useState(false);

    const [year, setYear] = useState(initialYear);

    useEffect(() => {
        getAllSales()
            .then(data => {
                setSalesData(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("매출 데이터 조회 실패:", error);
                setIsLoading(false);
            });
    }, [refresh, year]);

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>매출 현황</Text>

                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setYearModalVisible(true)}
                >
                    <Text>{year}</Text>
                </TouchableOpacity>

                <YearSelectorModal
                    visible={yearModalVisible}
                    onClose={() => setYearModalVisible(false)}
                    onSelect={(selectedYear) => {
                        setYear(selectedYear);
                        setYearModalVisible(false);
                    }}
                />
            </View>
            
            {isLoading ? (
                <Text>로딩 중...</Text>
            ) : salesData.length === 0 ? (
                <Text style={styles.emptyText}>매출 데이터가 없습니다.</Text>
            ) : (
                salesData.map((item, index) => (
                <View key={index} style={styles.recordRow}>
                    <Text>{item.date}</Text>
                    <Text>목표: {item.target.toLocaleString()}만원</Text>
                    <Text>달성: {item.amount.toLocaleString()}만원</Text>
                </View>
                ))
            )}      
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
    },
    dateButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#038CD0",
        borderRadius: 5,
        marginRight: 10,
    },
    emptyText: {
        color: "#999",
        fontStyle: "italic",
    },
    recordRow: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderColor: "#eee",
        paddingBottom: 8,
    },
})

export default SalesRecords;