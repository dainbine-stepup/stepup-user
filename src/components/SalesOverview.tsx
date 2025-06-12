import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// DB
import { findSalesByYear } from "../database/SalesRepository";

interface SalesOverviewProps {
  year: string;
  month: string;
  onDataLoaded: (data: any) => void;
};

interface SalesRecord {
  date: string;
  target: number;
  amount: number;
  rate: number;
}

function SalesOverview({ year, month, onDataLoaded }: SalesOverviewProps) {


  // 매출 데이터
  const [yearData, setYearData] = useState<SalesRecord[]>([]);

  useEffect(() => {
    findSalesByYear(year)
      .then((data: SalesRecord[]) => {
        setYearData(data);
        const overview = calculateOverviewData(data, year, month);
        onDataLoaded(overview);
      })
      .catch((error) => {
        console.error("매출 조회 실패", error);
      });
  }, [year, month])

  const { totalYearAmount, totalYearTarget, monthAmount, monthTarget } = useMemo(() => {
    return calculateOverviewData(yearData, year, month);
  }, [yearData, year, month]);

  function calculateOverviewData(data: SalesRecord[], year: string, month: string) {
    const totalYearAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const totalYearTarget = data.reduce((sum, item) => sum + item.target, 0);

    const monthKey = `${year}-${month.padStart(2, '0')}`;
    const monthData = data.find(item => item.date === monthKey);
    const monthAmount = monthData?.amount || 0;
    const monthTarget = monthData?.target || 0;

    return {
      totalYearAmount,
      totalYearTarget,
      monthAmount,
      monthTarget,
    };
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.item}>
          <View style={styles.itemTitle}>
            <Text style={styles.itemTitleText}>{year}년 매출 현황</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemContentText}>{totalYearAmount.toLocaleString()}</Text>
            <Text style={styles.itemContentSubText}>원</Text>
          </View>
        </View>
        <View style={styles.item}>
          <View style={styles.itemTitle}>
            <Text style={styles.itemTitleText}>{month}월 매출 현황</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemContentText}>{monthAmount.toLocaleString()}</Text>
            <Text style={styles.itemContentSubText}>원</Text>
          </View>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.item}>
          <View style={styles.itemTitle}>
            <Text style={styles.itemTitleText}>{year}년 달성 목표</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemContentText}>{totalYearTarget.toLocaleString()}</Text>
            <Text style={styles.itemContentSubText}>원</Text>
          </View>
        </View>
        <View style={styles.item}>
          <View style={styles.itemTitle}>
            <Text style={styles.itemTitleText}>{month}월 달성 목표</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemContentText}>{monthTarget.toLocaleString()}</Text>
            <Text style={styles.itemContentSubText}>원</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    width: "48%",
    height: 70,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    backgroundColor: "#FFF",
    borderRadius: 8,
    flexDirection: "column",
  },
  itemTitle: {
    flex: 0.5,
    justifyContent: "center",
  },
  itemTitleText: {
    color: "#666666",
    fontWeight: "bold",
    fontSize: 14,
  },
  itemContent: {
    flex: 0.5,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 5,
  },
  itemContentText: {
    color: "#0068F9",
    fontWeight: "bold",
    fontSize: 16,
  },
  itemContentSubText: {
    color: "#0068F9",
    fontSize: 14,
  },
});

export default SalesOverview;