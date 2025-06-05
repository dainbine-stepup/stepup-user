import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";

// 컴포넌트
import Header from "../components/Header";
import Footer from "../components/Footer";
import SalesGoalSetter from "../components/SalesGoalSetter"; // 매출 설정
import SalesRecords from "../components/SalesRecords"; // 매출 현황

function SalesScreen() {
    // 변수
    // 현재 년/월 저장
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    // 매출 현황 새로고침
    const [refreshFlag, setRefreshFlag] = useState(false); 
    // 매출 설정 리셋(입력창 비우기)
    const [resetFlag, setResetFlag] = useState(false);

    // 매출 설정에서 적용했을 때 매출 현황 리프레시
    const triggerRefresh = () => {
        setRefreshFlag(prev => !prev);
    };

    // 포커스될 때 현재 날짜로 초기화
    const [componentKey, setComponentKey] = useState(0);
    useFocusEffect(
        React.useCallback(() => {
            // 현재 시간 계산
            const now = new Date();
            const currentYear = String(now.getFullYear());
            const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
            
            setYear(currentYear);
            setMonth(currentMonth);

            setComponentKey(prev => prev + 1);
            setRefreshFlag(prev => !prev);

            return () => {
                setResetFlag(prev => !prev); // 화면 떠날 때 goal/amount 초기화
            };
        }, [])
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Header />

                {/* 매출 설정 */}
                <SalesGoalSetter
                    key={`goalsetter-${componentKey}`}
                    onSave={triggerRefresh}
                    reset={resetFlag}
                    initialYear={year}
                    initialMonth={month}
                />

                {/* 매출 관리 */}
                <SalesRecords
                    key={`salesrecords-${componentKey}`}
                    refresh={refreshFlag}
                    initialYear={year}
                />
                <Footer />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 10,
        gap: 20,
        flexDirection: "column",
    }
})

export default SalesScreen;