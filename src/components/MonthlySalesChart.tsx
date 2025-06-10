import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { Polyline, Polygon, Circle, Text as SvgText, G, Line, Path } from 'react-native-svg';

interface SalesRecord {
  date: string;
  amount: number;
}

interface MonthlySalesChartProps {
  year: string;
  data: SalesRecord[];
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ year, data }) => {

  // 디바이스의 화면 너비
  const screenWidth = Dimensions.get('window').width;
  
  // 전체 padding 10 + 10 = 20 고려해서 그래프 크기 설정
  const outerPadding = 20;
  const padding = 20; // 내부 그래프 패딩
  const chartHeight = screenWidth / 2;
  const chartWidth = screenWidth - outerPadding - padding * 2;

  // 1월부터 12월까지 월별 매출(amount)을 추출해 배열로 생성
  const monthlyAmounts = Array.from({ length: 12 }, (_, i) => {
    const key = `${year}-${String(i + 1).padStart(2, '0')}`;
    const item = data.find(d => d.date === key);
    return item?.amount || 0;
  });

  // 가장 큰 매출 값 (y축 스케일 기준)
  const maxAmount = Math.max(...monthlyAmounts, 100000); // 0 방지용으로 최소 100000

  // 실제 그래프가 그려지는 영역 높이 (패딩 제외)
  const chartAreaHeight = chartHeight - padding * 2;

  // 실제 그래프가 그려지는 영역 너비 (패딩 제외)
  const chartAreaWidth = chartWidth - padding * 2;

  // 각 점 사이의 간격 (X축 간격)
  const pointGap = (chartAreaWidth - padding) / (monthlyAmounts.length - 1);

  // Y축 스케일 계산 (매출 금액 → 픽셀로 변환)
  const scaleY = chartAreaHeight / maxAmount;

  // Polyline을 위한 점 좌표 문자열 (ex: "20,100 40,90 60,80 ..." 형식)
  const points = monthlyAmounts.map((amount, index) => {
    const x = outerPadding + padding + 5 + index * pointGap;
    const y = chartHeight - padding - amount * scaleY;
    return `${x},${y}`;
  }).join(' ');

  // 각 월의 (x, y) 점 좌표 배열
  const pointCoords = monthlyAmounts.map((amount, index) => {
    const x = outerPadding + padding + 5 + index * pointGap;
    const y = chartHeight - padding - amount * scaleY;
    return { x, y };
  });

  // Y축 라벨/그리드 계산
  const yStep = 5;
  const yLabelGap = Math.ceil(maxAmount / yStep);
  const yLabels = Array.from({ length: yStep + 1 }, (_, i) => i * yLabelGap);

  // 만원 단위 라벨 포맷
  const formatToMan = (value: number): string => {
    return `${Math.round(value / 10000)}`;
  };

  // 부드러운 곡선 Path
  const getSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      const cy = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${prev.y} ${cx} ${cy}`;
    }
    const last = points[points.length - 1];
    d += ` T ${last.x} ${last.y}`;
    return d;
  };

  // Polyline용 좌표 문자열
  const linePoints = pointCoords.map(pt => `${pt.x},${pt.y}`).join(' ');

  // 아래 채움 영역을 위한 Polygon 좌표
  const fillPoints = [
    `${pointCoords[0].x},${chartHeight - padding}`, // 시작점 아래
    ...pointCoords.map(pt => `${pt.x},${pt.y}`),
    `${pointCoords[pointCoords.length - 1].x},${chartHeight - padding}` // 끝점 아래
  ].join(' ');

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>{year}년 월별 매출 현황</Text>
      </View>
      <View style={styles.yLabelUnitContainer}>
        <Text style={styles.yLabelUnitText}>(단위: 만원)</Text>
      </View>
      <Svg width={chartWidth + padding * 2} height={chartHeight}>
        <G>
          {/* ✅ Y축 라벨 + 그리드선 */}
          {yLabels.map((label, i) => {
            const y = chartHeight - padding - label * scaleY;
            return (
              <G key={`y-label-${i}`}>
                {/* 그리드 선 */}
                <Line
                  x1={padding + 15}
                  x2={chartWidth}
                  y1={y}
                  y2={y}
                  stroke="#ddd"
                  strokeWidth="1"
                />
                {/* Y축 텍스트 */}
                <SvgText
                  x={padding + 10}
                  y={y + 4}
                  fontSize="10"
                  fill="black"
                  textAnchor="end"
                >
                  {formatToMan(label)}
                </SvgText>
              </G>
            );
          })}

          {/* 아래 채움 영역 */}
          <Polygon
            points={fillPoints}
            fill="rgba(66, 133, 244, 0.2)"
          />

          {/* 선형 그래프 */}
          <Polyline
            points={linePoints}
            fill="none"
            stroke="#4285F4"
            strokeWidth="1"
          />

          {/* 각 점 */}
          {pointCoords.map((pt, index) => (
            <Circle key={index} cx={pt.x} cy={pt.y} r="3" fill="#4285F4" />
          ))}

          {/* X축 라벨 */}
          {pointCoords.map((pt, index) => (
            <SvgText
              key={`x-label-${index}`}
              x={pt.x}
              y={chartHeight - padding + 15}
              fontSize="10"
              fill="black"
              textAnchor="middle"
            >
              {index + 1}
            </SvgText>
          ))}
        </G>
      </Svg>
      <View style={styles.xLabelUnitContainer}>
        <Text style={styles.xLabelUnitText}>(단위: 월)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingVertical: 10,
  },
  title: {
    padding: 10,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  yLabelUnitContainer: {
    paddingLeft: 15,
  },
  yLabelUnitText: {  
    fontSize: 10,
  },
  xLabelUnitContainer: {
    paddingRight: 20,
    alignItems: "flex-end",
  },
  xLabelUnitText: {  
    fontSize: 10,
  },
})

export default MonthlySalesChart;
