import React, {useState, useRef} from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

// 컴포넌트
import Header from "../components/Header";
import Footer from "../components/Footer";
import YearMonthSelector from "../components/YearMonthSelector";
import SalesOverview from '../components/SalesOverview';
import SalesPerformance from '../components/SalesPerformance';
import AdviceBoard from "../components/AdviceBoard";
import { DrawerParamList } from '../types/navigationTypes';

function MainScreen() {

    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

    const scrollRef = useRef<ScrollView>(null);

    // 현재 날짜 계산
    const now = new Date();
    const defaultYear = String(now.getFullYear());
    const defaultMonth = String(now.getMonth() + 1).padStart(2, "0");

    // 상태 초기값으로 사용
    const [year, setYear] = useState(defaultYear);
    const [month, setMonth] = useState(defaultMonth);

    const [overviewData, setOverviewData] = useState<any>(null);
    
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
    
    // 상담 문의 문자 이동
    const handleConsultRequest = () => {

        Alert.alert(
            "상담 요청",
            `비투스 상담 담당자에게 상담을 요청할 수 있습니다.\n${year}년 ${month}월 데이터를 상담 문자로 보내시겠습니까?`,
            [
                {
                    text: "취소",
                    style: "cancel",
                },
                {
                    text: "확인",
                    onPress: () => {
                        const CONSULT_PHONE_NUMBER = "01067116227";
                        const { totalYearAmount, totalYearTarget, monthAmount, monthTarget } = overviewData;
                        const yearRate = totalYearTarget > 0 ? Math.round((totalYearAmount / totalYearTarget) * 100) : 0;
                        const monthRate = monthTarget > 0 ? Math.round((monthAmount / monthTarget) * 100) : 0;

                        const messageLines = [
                            `[Step Up 상담 요청]`,
                            ``,
                            `${year}년 총 달성액: ${totalYearAmount.toLocaleString()}원`,
                            `${year}년 총 목표액: ${totalYearTarget.toLocaleString()}원`,
                            `${year}년 달성률: ${yearRate}%`,
                            ``,
                            `${month}월 달성액: ${monthAmount.toLocaleString()}원`,
                            `${month}월 목표액: ${monthTarget.toLocaleString()}원`,
                            `${month}월 달성률: ${monthRate}%`,
                            ``
                        ];

                        const message = messageLines.join('\n');

                        // 문자앱 열기
                        const smsUrl = `sms:${CONSULT_PHONE_NUMBER}?body=${encodeURIComponent(message)}`;
                        Linking.openURL(smsUrl).catch(err => {
                            Alert.alert("오류", "문자 앱을 열 수 없습니다.");
                            console.error("문자 앱 오류:", err);
                        });
                    },
                },
            ]
        )
    }

    return (
        <ScrollView ref={scrollRef} style={styles.container}>
            <View style={styles.content}>
                <Header />

                <YearMonthSelector 
                    title={'매출 현황'}
                    year={year}
                    month={month}
                    onChangeYear={setYear}
                    onChangeMonth={setMonth}
                />

                {year && month && (
                    <SalesOverview
                        key={`salesoverview-${componentKey}`}
                        year={year}
                        month={month}
                        onDataLoaded={(data) => {
                        setOverviewData(data);
                        }}
                    />
                )}

                <SalesPerformance
                    key={`salesperformance-${componentKey}`}
                    year={year}
                    month={month}
                />

                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Sales')}
                    >
                        <Text style={styles.buttonText}>매출 관리</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleConsultRequest}
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

export default MainScreen;