import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';

// 컴포넌트
import Header from "../components/Header";
import Footer from "../components/Footer";
import SalesOverview from '../components/SalesOverview';
import SalesPerformance from '../components/SalesPerformance';

type MyPageStackParamList = {
  MyPage: undefined;
  SalesFromMyPage: undefined;
};

function MyPageScreen() {

    const navigation = useNavigation<StackNavigationProp<MyPageStackParamList>>();
    const scrollRef = useRef<ScrollView>(null);

    // 변수
    // 현재 년/월 저장
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");

    // 포커스될 때 현재 날짜로 초기화
    const [componentKey, setComponentKey] = useState(0);
    useFocusEffect(
        React.useCallback(() => {

            // 스크롤 맨 위로 이동
            scrollRef.current?.scrollTo({ y: 0, animated: false });
            
            // 현재 시간 계산
            const now = new Date();
            const currentYear = String(now.getFullYear());
            const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
            
            setYear(currentYear);
            setMonth(currentMonth);

            setComponentKey(prev => prev + 1);

        }, [])
    );

    return (
        <ScrollView ref={scrollRef} style={styles.container}>
            <View style={styles.content}>
                <Header />

                <SalesOverview
                    key={`salesoverview-${componentKey}`}
                    initialYear={year}
                    initialMonth={month}
                />

                <SalesPerformance
                    key={`salesperformance-${componentKey}`}
                    initialYear={year}
                    initialMonth={month}
                />

                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("SalesFromMyPage")}
                    >
                        <Text style={styles.buttonText}>매출 관리</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => Alert.alert('알림', '준비중입니다.')}
                    >
                        <Text style={styles.buttonText}>상담 문의</Text>
                    </TouchableOpacity>
                </View>

                <Footer />

            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flex: 1,
    },
    content: {
        gap: 20,
        flexDirection: "column",
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
    },
    button: {
        width: "45%",
        height: 40,
        backgroundColor: "#038CD0",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
})

export default MyPageScreen;