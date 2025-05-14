export type AgencyInfo = {
  name: string;
  url: string;
};

export type AdviceInfo = {
  analysis: string;
  advice: string;
  agencies: AgencyInfo[];
};

export const adviceData: { [range: string]: AdviceInfo } = {
  veryLow: {
    analysis: "매우 낮은 달성률입니다. 실적이 거의 없는 상태입니다.",
    advice: "실적 입력을 빠짐없이 진행하고, 일 단위 매출 목표부터 다시 점검하세요.",
    agencies: [
      { name: "소상공인시장진흥공단", url: "https://www.semas.or.kr/" },
      { name: "서울신용보증재단", url: "https://www.seoulshinbo.co.kr/" },
      { name: "소상공인희망센터", url: "https://hope.semas.or.kr/" },
      { name: "신용보증기금", url: "https://www.kodit.co.kr/" },
    ],
  },
  low: {
    analysis: "달성률이 낮은 편입니다. 실적 증가를 위한 전략이 필요합니다.",
    advice: "소규모 마케팅 활동 또는 프로모션 전략을 시도해 보세요.",
    agencies: [
      { name: "소상공인진흥센터", url: "https://www.sbiz.or.kr/" },
      { name: "서울산업진흥원", url: "https://www.sba.seoul.kr/" },
      { name: "중소기업유통센터", url: "https://www.sbdc.or.kr/" },
      { name: "지역신용보증재단", url: "https://www.koreg.or.kr/" },
    ],
  },
  mid: {
    analysis: "달성률이 평균 수준입니다. 현재 흐름을 유지하면 목표 달성이 가능합니다.",
    advice: "계속해서 일별 매출을 기록하고 비용 구조를 분석해보세요.",
    agencies: [
      { name: "중소기업진흥공단", url: "https://www.kosmes.or.kr/" },
      { name: "대한상공회의소", url: "https://www.korcham.net/" },
      { name: "한국여성경제인협회", url: "https://www.womanbiz.or.kr/" },
      { name: "소상공인마당", url: "https://www.sbiz.or.kr/" },
    ],
  },
  high: {
    analysis: "높은 달성률입니다. 매출이 안정적으로 발생하고 있습니다.",
    advice: "이 상태를 유지하며 고객 관리 및 재구매 전략에 집중하세요.",
    agencies: [
      { name: "소상공인진흥센터", url: "https://www.sbiz.or.kr/" },
      { name: "서울산업진흥원", url: "https://www.sba.seoul.kr/" },
      { name: "창업진흥원", url: "https://www.kised.or.kr/" },
      { name: "K-스타트업", url: "https://www.k-startup.go.kr/" },
    ],
  },
  veryHigh: {
    analysis: "매우 높은 달성률입니다. 목표를 초과 달성 중입니다.",
    advice: "장기적인 성장 계획과 세무 전략을 함께 고려해보세요.",
    agencies: [
      { name: "대한상공회의소", url: "https://www.korcham.net/" },
      { name: "중소기업진흥공단", url: "https://www.kosmes.or.kr/" },
      { name: "소상공인시장진흥공단", url: "https://www.semas.or.kr/" },
      { name: "한국세무사회", url: "https://www.kacpta.or.kr/" },
    ],
  },
};
