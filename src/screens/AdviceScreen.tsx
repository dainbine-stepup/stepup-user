import React, {useState} from "react";
import {View, Text, Linking, TouchableOpacity, ScrollView, StyleSheet} from "react-native";
import { adviceData } from "../data/AdviceInfo"
import PeriodSelector from "../components/PeroidSelector";

function AdviceScreen () {

    // 달성율
    const [achievementRate, setAchievementRate] = useState<number>(51.5);

    // 달성률 구간 판단 함수
    const getRange = (rate: number): string => {
        if (rate <= 30) return "veryLow";
        if (rate <= 50) return "low";
        if (rate <= 70) return "mid";
        if (rate <= 90) return "high";
        return "veryHigh";
    };

    // 범위 및 상담 데이터
    const range = getRange(achievementRate);
    const advice = adviceData[range];

    // 기간 선택 관련 상태
    const [selected, setSelected] = useState("월"); // 월/주
    const [selectedPeriod, setSelectedPeriod] = useState("기간을 선택하세요");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    return (
        <ScrollView style={styles.container}>
            {/* 기간 설정 섹션 */}
            <View>
                <PeriodSelector
                    selected={selected}
                    selectedPeriod={selectedPeriod}
                    dateRange={dateRange}
                    setSelected={setSelected}
                    setSelectedPeriod={setSelectedPeriod}
                    onChangeDate={setDateRange}
                />
            </View>

            {/* 사용자 매출 데이터 섹션 */}
            <View>
                <Text>현재 달성율: {achievementRate}%</Text>
            </View>
                
            {/* 분석 섹션 */}
            <View>
                <Text>분석</Text>
                <Text>{advice.analysis}</Text>
            </View>

            {/* 조언 섹션 */}
            <View>
                <Text>조언</Text>
                <Text>{advice.advice}</Text>
            </View>

            {/* 추천 상담기관 섹션 */}
            <View>
                <Text>추천 상담기관</Text>
                {advice.agencies.map((agency, index) => (
                    <TouchableOpacity key={index} onPress={() => Linking.openURL(agency.url)}>
                        <Text>• {agency.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
});

export default AdviceScreen;