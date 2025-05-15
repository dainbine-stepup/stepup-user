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
        <Text style={styles.label}>매출 목표</Text>
        <Text style={styles.value}>{parseInt(salesTarget).toLocaleString()}원</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>매출 실적</Text>
        <Text style={styles.value}>{totalAmount.toLocaleString()}원</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>달성율</Text>
        <Text style={styles.value}>{achievementRate.toFixed(1)}%</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default ChartData;