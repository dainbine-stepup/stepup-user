import { months } from "moment";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

// DB
import { getAllSales, findSalesByYear } from "../database/SalesRepository";

// 컴포넌트
import MonthlySalesChart from "./MonthlySalesChart";

interface SalesPerformanceProps {
    initialYear: string;
    initialMonth: string;
}

interface SalesRecord {
  date: string;
  target: number;
  amount: number;
  rate: number;
}

function SalesPerformance({ initialYear, initialMonth }: SalesPerformanceProps) {

    // 년/월 저장(검색용)
    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);

    const [yearData, setYearData] = useState<SalesRecord[]>([]);

    useEffect(() => {
        findSalesByYear(year)
            .then((data) => {
                setYearData(data);
            })
            .catch((error) => {
                console.error("데이터 로드 실패:", error);
            });
    }, [year])

    // 연도 전체 합계 기준 달성률 계산
    const totalYearAmount = yearData.reduce((sum, item) => sum + item.amount, 0);
    const totalYearTarget = yearData.reduce((sum, item) => sum + item.target, 0);

    const yearRate = totalYearTarget > 0 ? Math.round((totalYearAmount / totalYearTarget) * 100) : 0;

    const monthKey = `${year}-${month.padStart(2, '0')}`;
    const monthData = yearData.find(item => item.date === monthKey);
    const monthAmount = monthData?.amount || 0;
    const monthTarget = monthData?.target || 0;

    const monthRate = monthTarget > 0 ? Math.round((monthAmount / monthTarget) * 100) : 0;

    return (
        <View style={styles.container}>
            <View style={styles.title}>
                <Text style={styles.titleText}>매출 목표 달성률</Text>
            </View>
            <View style={styles.achievementContainer}>
                <View style={[styles.circleWrapper, styles.yearCircle]}>
                    <Text style={styles.yearLabel}>년 달성률</Text>
                    <Text style={styles.yearPercent}>{yearRate}</Text>
                    <Text style={styles.yearUnit}>%</Text>
                </View>

                <View style={[styles.circleWrapper, styles.monthCircle]}>
                    <Text style={styles.monthLabel}>월 달성률</Text>
                    <Text style={styles.monthPercent}>{monthRate}</Text>
                    <Text style={styles.monthUnit}>%</Text>
                </View>
            </View>

            <View>
                {/* 그래프 */}
                <MonthlySalesChart year={year} data={yearData} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: "#FFF",
        borderRadius: 8,
    },
    title: {
        paddingHorizontal: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    titleText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    achievementContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 40,
    },
    achievementItem: {
        alignItems: 'center',
    },
    circleWrapper: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FBFF', // 공통 배경
    },
    yearCircle: {
        borderWidth: 2,
        borderColor: '#4285F4',        // 파란색 테두리
    },
    monthCircle: {
        borderWidth: 2,
        borderColor: '#00C98D',        // 초록색 테두리
    },
    yearLabel: {
        fontSize: 18,
        fontWeight: "bold",
        color: '#0068F9',
        marginBottom: 5,
    },
    yearPercent: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0068F9',
    },
    yearUnit: {
        fontSize: 16,
        color: '#0068F9',
        marginTop: 2,
    },
    monthLabel: {
        fontSize: 18,
        fontWeight: "bold",
        color: '#00BBA8',
        marginBottom: 5,
    },
    monthPercent: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0089AD',
    },
    monthUnit: {
        fontSize: 16,
        color: '#0089AD',
        marginTop: 2,
    },
});

export default SalesPerformance;