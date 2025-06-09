import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// DB
import { getAllSales, findSalesByYear } from "../database/SalesRepository";

interface SalesOverviewProps {
  initialYear: string;
  initialMonth: string;
};

interface SalesRecord {
  date: string;
  target: number;
  amount: number;
  rate: number;
}

function SalesOverview({ initialYear, initialMonth }: SalesOverviewProps) {

  // 년/월 저장(검색용)
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  // 매출 데이터
  const [yearData, setYearData] = useState<SalesRecord[]>([]);

  useEffect(() => {
    findSalesByYear(year)
      .then((data) => {
        setYearData(data);
      })
      .catch((error) => {
        console.error("연도별 매출 조회 실패", error);
      });
  }, [year])

  const totalYearAmount = yearData.reduce((sum, item) => sum + item.amount, 0);
  const totalYearTarget = yearData.reduce((sum, item) => sum + item.target, 0);

  const monthKey = `${year}-${month.padStart(2, '0')}`;
  const monthData = yearData.find(item => item.date === monthKey);
  const monthAmount = monthData?.amount || 0;
  const monthTarget = monthData?.target || 0;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>매출현황</Text>
      </View>
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
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
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