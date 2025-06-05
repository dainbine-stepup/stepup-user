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
                <Text style={styles.title}>매출설정</Text>
            </View>
            <View style={styles.setterContainer}>

                {/* 년/월 입력창 */}
                <View style={styles.row}>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setYearModalVisible(true)}
                    >
                        <Text>{year}</Text>
                    </TouchableOpacity>
                    <Text>년</Text>

                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setMonthModalVisible(true)}
                    >    
                        <Text>{month}</Text>
                    </TouchableOpacity>
                    <Text>월</Text>
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
                <View style={styles.row}>
                    <Text>목표 금액</Text>
                    <TextInput
                        value={goal}
                        onChangeText={setGoal}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <Text>만원</Text>
                </View>

                {/* 달성 금액 입력창 */}
                <View style={styles.row}>
                    <Text>달성 금액</Text>
                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <Text>만원</Text>
                </View>
                
                {/* 적용하기 버튼 */}
                <Button title="적용하기" onPress={applyHandler} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#ccc',
    },
    titleContainer: {
        padding: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
    },
    setterContainer: {
        padding: 10,
    },
    row: {
        flexDirection: "row",
        gap: 5,
        marginBottom: 10,
    },
    dateButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#038CD0",
        borderRadius: 5,
        marginRight: 10,
    },
    input: {
        width: "50%",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 8,
        borderRadius: 5,
        marginBottom: 10,
    },
})

export default SalesGoalSetter;
