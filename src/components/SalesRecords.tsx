import React, { useState, useEffect } from "react";
import { Alert, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// DB
import { updateSales, deleteSales, findSalesByYear } from "../database/SalesRepository";

// 컴포넌트
import YearSelectorModal from "./YearSelectorModal";
import SalesEditModal from "./SalesEditModal";

interface SalesRecord {
  sales_id: number;
  date: string;
  target: number;
  amount: number;
  rate: number;
}

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

    // 매출 데이터 수정 삭제할 때 사용
    const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);

    // onSave 함수
    const handleSave = async (updated: SalesRecord) => {
        try {
            await updateSales(updated.date, updated.target, updated.amount); // DB 수정
            const newData = await findSalesByYear(year); // 다시 조회
            setSalesData(newData);
            setEditModalVisible(false);
            setSelectedRecord(null);

            Alert.alert("수정 완료", `${updated.date}의 매출 데이터가 수정되었습니다.`);
        } catch (err) {
            console.error("수정 실패:", err);
            Alert.alert("오류", "매출 데이터를 수정하는 데 실패했습니다.");
        }
    };

    // onDelete 함수
    const handleDelete = async (date: string) => {
        console.log('ㅎㅇ')
        try {
            await deleteSales(date); // DB 삭제
            const newData = await findSalesByYear(year); // 다시 조회
            setSalesData(newData);
            setEditModalVisible(false);
            setSelectedRecord(null);

            Alert.alert("삭제 완료", `${date}의 매출 데이터가 삭제되었습니다.`);
        } catch (err) {
            console.error("삭제 실패:", err);
            Alert.alert("오류", "매출 데이터를 삭제하는 데 실패했습니다.");
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>매출 현황</Text>

                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setYearModalVisible(true)}
                >
                    <Text style={styles.dateButtonText}>{year}</Text>
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
                        <View style={styles.messageBox}>
                            <Text style={styles.messageText}>로딩 중...</Text>
                        </View>
                    ) : salesData.length === 0 ? (
                        <View style={styles.messageBox}>
                            <Text style={styles.messageText}>매출 데이터가 없습니다.</Text>
                        </View>
                    ) : (
                        <>
                            {salesData.map((item) => (
                                <TouchableOpacity
                                    key={item.sales_id}
                                    style={styles.recordRow}
                                    onPress={() => {
                                        setSelectedRecord(item);
                                        setEditModalVisible(true);
                                    }}
                                >
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
                                </TouchableOpacity>
                            ))}

                            {/* 수정 삭제 모달 */}
                            <SalesEditModal
                                visible={editModalVisible}
                                data={selectedRecord}
                                onClose={() => {
                                    setEditModalVisible(false);
                                    setSelectedRecord(null);
                                }}
                                onSave={handleSave}
                                onDelete={handleDelete}
                            />

                            {/* 합계 출력 */}
                            {(() => {
                                const totalTarget = salesData.reduce((sum, item) => sum + item.target, 0);
                                const totalAmount = salesData.reduce((sum, item) => sum + item.amount, 0);
                                const totalRate =
                                totalTarget > 0 ? Math.round((totalAmount / totalTarget) * 100) : 0;

                                return (
                                    <View style={styles.totalRow}>
                                        <View style={styles.recordItem}>
                                            <Text style={styles.itemText}>합계</Text>
                                        </View>
                                        <View style={styles.recordItem}>
                                            <Text style={styles.itemTotalText}>{totalTarget.toLocaleString()}</Text>
                                        </View>
                                        <View style={styles.recordItem}>
                                            <Text style={styles.itemTotalText}>{totalAmount.toLocaleString()}</Text>
                                        </View>
                                        <View style={styles.recordItem}>
                                            <Text style={styles.itemTotalText}>{totalRate}%</Text>
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
        backgroundColor: "#FFF",
        borderRadius: 8,
        padding: 10,
    },
    titleContainer: {
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",        
    },
    dateButton: {
        width: 70,
        height: 30,
        borderWidth: 1.5,
        borderColor: "#038CD0",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    dateButtonText: {
        fontSize: 14,
    },
    recordContainer: {

    },
    recordHeader: {
        flexDirection: "row",
        paddingVertical: 15,
        borderBottomWidth: 2,
        borderColor: "#ccc",
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
    },
    itemText: {
        fontSize: 12,
    },
    messageBox: {
        height: 200,
        justifyContent: "center",
        alignItems: "center",
    },
    messageText: {
        color: "#999",
        fontSize: 20,
    },
    recordRow: {
        flexDirection: "row",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    totalRow: {
        flexDirection: "row",
        paddingVertical: 15,
    },
    itemTotalText: {
        color: "#038CD0",
        fontSize: 12,
    }
})

export default SalesRecords;