import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, Alert } from "react-native";

// DB
import {
    insertSales,
    updateSales,
    findSalesByDate
} from "../database/SalesRepository";

// 컴포넌트
import YearSelectorModal from "./YearSelectorModal"; // 년 선택 모달
import MonthSelectorModal from "./MonthSelectorModal"; // 월 선택 모달

interface SalesGoalSetterProps {
  onSave: () => void; // 저장하기 했을 때 호출(매출 현황 새로고침)
  reset: boolean; // 페이지 나갈 때 입력창 비우기
  initialYear: string; // 현재 시간(년)
  initialMonth: string; // 현재 시간(월)
}

function SalesGoalSetter({ onSave, reset, initialYear, initialMonth }: SalesGoalSetterProps) {

    // 변수
    const [goal, setGoal] = useState(""); // 목표 금액
    const [amount, setAmount] = useState(""); // 달성 금액

    // reset 감지 -> 입력창 비우기
    useEffect(() => {
        setGoal("");
        setAmount("");
    }, [reset]);

    // 년/월
    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);
    
    // SalesScreen에서 넘어오는 년/월 변경 감지
    useEffect(() => {
        if (initialYear) setYear(initialYear);
        if (initialMonth) setMonth(initialMonth);
    }, [initialYear, initialMonth]);

    // 년/월 모달 표시
    const [yearModalVisible, setYearModalVisible] = useState(false);
    const [monthModalVisible, setMonthModalVisible] = useState(false);


    // 매출 설정 저장 버튼
    const applyHandler = async () => {
        const date = `${year}-${month}`;
        const targetValue = parseInt(goal, 10);
        const amountValue = parseInt(amount, 10);

        if (isNaN(targetValue) || isNaN(amountValue)) {
            Alert.alert("입력 오류", "금액을 입력해주세요.");
            return;
        }

        try {
            const existing = await findSalesByDate(date); // 데이터 중복 확인

            if (existing) {
                Alert.alert(
                    "중복된 데이터",
                    `${date}에 이미 데이터가 존재합니다.\n덮어쓰시겠습니까?`,
                    [
                        { text: "취소", style: "cancel" },
                        {
                            text: "덮어쓰기",
                            style: "destructive",
                            onPress: async () => {
                                await updateSales(date, targetValue, amountValue);
                                Alert.alert("수정 완료", `${date} 매출 정보가 수정되었습니다.`);
                                onSave(); // 매출 현황 새로고침
                                setGoal(""); // 목표 금액 입력창 비우기
                                setAmount(""); // 달성 금액 입력창 비우기
                            }
                        }
                    ]
                );
            } else {
                await insertSales(date, targetValue, amountValue);
                Alert.alert("저장 완료", `${date} 매출 정보가 저장되었습니다.`);
                onSave(); // 매출 현황 새로고침
                setGoal("");
                setAmount("");
            }
        } catch (err) {
            console.error("DB 오류:", err);
            Alert.alert("DB 오류", "저장 중 문제가 발생했습니다.");
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>매출 설정</Text>
            </View>
            <View style={styles.setterContainer}>

                {/* 년/월 입력창 */}
                <View style={styles.dateRow}>
                    <View style={styles.dateButtonContainer}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setYearModalVisible(true)}
                        >
                            <Text style={styles.dateButtonText}>{year}</Text>
                        </TouchableOpacity>
                        <Text style={styles.setterText}>년</Text>
                    </View>
                    
                    <View style={styles.dateButtonContainer}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setMonthModalVisible(true)}
                        >    
                            <Text>{month}</Text>
                        </TouchableOpacity>
                        <Text style={styles.setterText}>월</Text>
                    </View>
                </View>

                {/* year modal */}
                <YearSelectorModal
                    visible={yearModalVisible}
                    onClose={() => setYearModalVisible(false)}
                    onSelect={(selectedYear) => {
                        setYear(selectedYear);
                        setYearModalVisible(false);
                    }}
                />

                {/* month modal */}
                <MonthSelectorModal
                    visible={monthModalVisible}
                    onClose={() => setMonthModalVisible(false)}
                    onSelect={(selectedMonth) => {
                        setMonth(selectedMonth);
                        setMonthModalVisible(false);
                }}
                />

                {/* 목표 금액 입력창 */}
                <View style={styles.inputRow}>
                    <View style={styles.inputTitle}>
                        <Text style={styles.setterText}>목표 금액</Text>
                    </View>
                    <View style={styles.inputBox}>
                        <TextInput
                            value={goal}
                            onChangeText={setGoal}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <Text style={styles.setterText}>원</Text>
                    </View>
                </View>

                {/* 달성 금액 입력창 */}
                <View style={styles.inputRow}>
                    <View style={styles.inputTitle}>
                        <Text style={styles.setterText}>달성 금액</Text>
                    </View>                    
                    <View style={styles.inputBox}>
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <Text style={styles.setterText}>원</Text>
                    </View>
                </View>
                
                {/* 적용하기 버튼 */}
                <TouchableOpacity style={styles.applyButton} onPress={applyHandler}>
                    <Text style={styles.applyButtonText}>적용하기</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFF",
        borderRadius: 8,
    },
    titleContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
    setterContainer: {
        padding: 20,
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 30,
    },
    dateButtonContainer: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
    },
    dateButton: {
        width: 100,
        height: 35,
        borderWidth: 1.5,
        borderColor: "#038CD0",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    dateButtonText: {
        fontSize: 16,
    },
    setterText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#008BF1",
    },
    inputRow: {
        paddingHorizontal: 10,
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        
    },
    inputTitle: {
        flexDirection: "row",
        alignItems: "center",
        flex: 0.3,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        flex: 0.7,
    },
    input: {
        width: "70%",
        borderWidth: 1,
        borderColor: "#038CD0",
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    applyButton: {
        marginTop: 20,
        marginHorizontal: 10,
        height: 40,
        backgroundColor: "#038CD0",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    applyButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
})

export default SalesGoalSetter;
