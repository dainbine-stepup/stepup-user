import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  salesTarget: string;
  totalAmount: number;
  achievementRate: number;
};

function ChartData({ salesTarget, totalAmount, achievementRate }: Props) {
  return (
    <>
      <View style={styles.row}>
        <Text>매출 목표</Text>
        <Text>{parseInt(salesTarget).toLocaleString()}원</Text>
      </View>

      <View style={styles.row}>
        <Text>매출 실적</Text>
        <Text>{totalAmount.toLocaleString()}원</Text>
      </View>

      <View style={styles.row}>
        <Text>달성율</Text>
        <Text>{achievementRate.toFixed(1)}%</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
});

export default ChartData;