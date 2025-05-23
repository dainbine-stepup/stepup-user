import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

interface GraphComponentProps {
    labels: string[];
    dataPoints?: number[];
    targetPoints?: number[];
    lineDataPoints?: number[];
    height?: number;
    padding?: number;
}

const GraphComponent: React.FC<GraphComponentProps> = ({
    labels, // x축 라벨 (날짜)
    dataPoints = [], // 실적
    targetPoints = [], // 목표
    lineDataPoints = [], // 달성율
    height = 200,
    padding = 40,
}) => {

    const formatNumber = (num: number): string => {
        return (num / 1000).toLocaleString('ko-KR'); // 예: 1,000
    };

    const maxBarValue = Math.max(...dataPoints, ...targetPoints);
    const safeMaxBarValue = maxBarValue === 0 ? 1 : maxBarValue;

    const barGroupWidth = 35;
    const barSpacing = 8;
    const chartWidth = labels.length * barGroupWidth;
    const chartHeight = height - padding * 2;

    const yStepCount = 10;
    const yStepValue = Math.ceil(maxBarValue / yStepCount / 1000) * 1000;
    const yTicks = Array.from({ length: yStepCount + 1 }, (_, i) => i * yStepValue).reverse();
    const rightYTicks = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]; // 고정 달성률 눈금

    return (
        <View style={styles.wrapper}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 5 }}>
                <Text style={{ fontSize: 10, color: '#888' }}>(단위: 천원)</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
                {/* 왼쪽 고정 y축 */}
                <Svg width={40} height={height}>
                    {yTicks.map((tick, index) => {
                        const y = padding + ((safeMaxBarValue - tick) / safeMaxBarValue) * chartHeight;
                        return (
                        <SvgText
                            key={index}
                            x={40}
                            y={y + 3}
                            fontSize="10"
                            fill="#333"
                            textAnchor="end"
                        >
                            {formatNumber(tick)}
                        </SvgText>
                        );
                    })}
                </Svg>

                {/* 중앙 스크롤 가능한 그래프 영역 */}
                <ScrollView horizontal>
                    <Svg width={chartWidth + padding / 2} height={height}>
                        {/* 보조선 */}
                        {yTicks.map((tick, index) => {
                            const y = padding + ((safeMaxBarValue - tick) / safeMaxBarValue) * chartHeight;
                            return (
                                <Line
                                    key={index}
                                    x1={0}
                                    y1={y}
                                    x2={chartWidth + padding}
                                    y2={y}
                                    stroke="#eee"
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* 막대그래프 (실적 + 목표) */}
                        {dataPoints.map((value, index) => {
                            const target = targetPoints?.[index] ?? 0;
                            const groupX = padding / 2 + index * barGroupWidth;

                            const actualHeight = (value / safeMaxBarValue) * chartHeight;
                            const targetHeight = (target / safeMaxBarValue) * chartHeight;

                            const actualY = height - padding - actualHeight;
                            const targetY = height - padding - targetHeight;

                            return (
                                <React.Fragment key={index}>
                                    {/* 실적 */}
                                    <Rect
                                        x={groupX}
                                        y={actualY}
                                        width={barGroupWidth / 2 - barSpacing}
                                        height={actualHeight}
                                        fill="royalblue"
                                        rx="2"
                                    />
                                    {/* 목표 */}
                                    <Rect
                                        x={groupX + (barGroupWidth / 2) - barSpacing}
                                        y={targetY}
                                        width={(barGroupWidth / 2) - barSpacing}
                                        height={targetHeight}
                                        fill="#bbb"
                                        rx="2"
                                    />
                                    {/* x축 라벨 */}
                                    <SvgText
                                        x={groupX + barGroupWidth / 2}
                                        y={height - 5}
                                        fontSize="10"
                                        fill="#333"
                                        textAnchor="end"
                                    >
                                        {labels[index]}
                                    </SvgText>
                                </React.Fragment>
                            );
                        })}

                        {/* 선형 그래프 */}
                        {lineDataPoints.length > 0 && (
                            <>
                                <Polyline
                                    points={lineDataPoints
                                    .map((v, i) => {
                                        const x = padding / 2 - barSpacing + i * barGroupWidth + barGroupWidth / 2;
                                        const value = yTicks[0] * v / 100;
                                        const y = padding + ((safeMaxBarValue - value) / safeMaxBarValue) * chartHeight;                                    
                                        return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="orange"
                                    strokeWidth="2"
                                />
                                {lineDataPoints.length > 0 &&
                                    lineDataPoints.map((v, i) => {
                                        const x = padding / 2 - barSpacing + i * barGroupWidth + barGroupWidth / 2;
                                        const y = height - padding -((v / 100) * chartHeight)
                                        
                                        return (
                                            <SvgText
                                                key={`line-value-${i}`}
                                                x={x}
                                                y={y - 6}
                                                fontSize="10"
                                                fill="#333"
                                                textAnchor="middle"
                                            >
                                                {v}%
                                            </SvgText>
                                        );
                                    })
                                }
                            </>
                        )}
                    </Svg>
                </ScrollView>

                {/* 오른쪽 고정 y축 (선형 기준) */}
                <Svg width={40} height={height}>
                    {yTicks.map((tick, index) => {
                        const y = padding + ((safeMaxBarValue - tick) / safeMaxBarValue) * chartHeight;
                        const percent = rightYTicks[index];
                        return (
                            <SvgText
                                key={index}
                                x={5}
                                y={y + 3}
                                fontSize="10"
                                fill="#666"
                                textAnchor="start"
                            >
                                {percent}
                            </SvgText>
                        );
                    })}
                </Svg>
            </View>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: 'royalblue' }]} />
                    <Text style={styles.legendText}>실적</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#bbb' }]} />
                    <Text style={styles.legendText}>목표</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: 'orange' }]} />
                    <Text style={styles.legendText}>달성률</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
wrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 5,
},
title: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    marginBottom: 10,
},
legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 10,
    gap: 15,
},
legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
},
legendColor: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 5,
},
legendText: {
    fontSize: 10,
    color: '#333',
},

});

export default GraphComponent;
