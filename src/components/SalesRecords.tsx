import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// DB
import { getAllSales, findSalesByYear } from "../database/SalesRepository";

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

    // 년 저장(검색용)
    const [year, setYear] = useState(initialYear);

    useEffect(() => {
        findSalesByYear(year)
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
            <View style={styles.recordContainer}>
                <View style={styles.recordHeader}>
                    <View style={styles.recordItem}>
                        <Text style={styles.itemHeaderText}>기간</Text>
                    </View>
                    <View style={styles.recordItem}>
                        <Text style={styles.itemHeaderText}>목표액</Text>
                    </View>
                    <View style={styles.recordItem}>
                        <Text style={styles.itemHeaderText}>달성액</Text>
                    </View>
                    <View style={styles.recordItem}>
                        <Text style={styles.itemHeaderText}>달성률</Text>
                    </View>
                </View>
                <View style={styles.recordBody}>
                    {isLoading ? (
                        <Text>로딩 중...</Text>
                    ) : salesData.length === 0 ? (
                        <Text style={styles.emptyText}>매출 데이터가 없습니다.</Text>
                    ) : (
                        <>
                            {salesData.map((item, index) => (
                                <View key={index} style={styles.recordRow}>
                                    <View style={styles.recordItem}>
                                        <Text style={styles.itemText}>{item.date}</Text>
                                    </View>
                                    <View style={styles.recordItem}>
                                        <Text style={styles.itemText}>{item.target.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.recordItem}>
                                        <Text style={styles.itemText}>{item.amount.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.recordItem}>
                                        <Text style={styles.itemText}>{item.rate}%</Text>
                                    </View>
                                </View>
                            ))}

                            {/* 합계 출력 */}
                            {(() => {
                                const totalTarget = salesData.reduce((sum, item) => sum + item.target, 0);
                                const totalAmount = salesData.reduce((sum, item) => sum + item.amount, 0);
                                const totalRate =
                                totalTarget > 0 ? Math.round((totalAmount / totalTarget) * 100) : 0;

                                return (
                                <View style={styles.recordRow}>
                                    <View style={styles.recordItem}>
                                    <Text style={styles.itemText}>합계</Text>
                                    </View>
                                    <View style={styles.recordItem}>
                                    <Text style={styles.itemText}>{totalTarget.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.recordItem}>
                                    <Text style={styles.itemText}>{totalAmount.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.recordItem}>
                                    <Text style={styles.itemText}>{totalRate}%</Text>
                                    </View>
                                </View>
                                );
                            })()}
                        </>
                    )}   
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
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
    recordContainer: {

    },
    recordHeader: {
        flexDirection: "row",
    },
    itemHeaderText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    recordBody: {
        flex: 1,
    },
    recordItem: {
        flex: 0.25,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    itemText: {
        fontSize: 12,
    },
    emptyText: {
        color: "#999",
        fontStyle: "italic",
    },
    recordRow: {
        flexDirection: "row",
        height: 40,
    },
})

export default SalesRecords;