import React, {useState, useRef} from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from "@react-navigation/native";

// 컴포넌트
import Header from "../components/Header";
import Footer from "../components/Footer";
import SalesOverview from '../components/SalesOverview';
import SalesPerformance from '../components/SalesPerformance';
import AdviceBoard from "../components/AdviceBoard";

function MainScreen() {

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

                <AdviceBoard />

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
})

export default MainScreen;