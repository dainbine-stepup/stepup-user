export type AgencyInfo = {
  name: string;
  url: string;
  phone?: string;
};

export type AdviceInfo = {
  analysis: string;
  advice: string;
  agencies: AgencyInfo[];
};

export const adviceData: {[range: string]: AdviceInfo} = {
  veryLow: {
    analysis: '매우 낮은 달성률입니다. 실적이 거의 없는 상태입니다.',
    advice:
      '실적 입력을 빠짐없이 진행하고, 일 단위 매출 목표부터 다시 점검하세요.',
    agencies: [
      {
        name: '소상공인시장진흥공단',
        url: 'https://www.semas.or.kr/',
        phone: '1357',
      },
      {
        name: '서울신용보증재단',
        url: 'https://www.seoulshinbo.co.kr/',
        phone: '1577-6119',
      },
      {
        name: '소상공인희망센터',
        url: 'https://hope.semas.or.kr/',
        phone: '1357',
      },
      {
        name: '신용보증기금',
        url: 'https://www.kodit.co.kr/',
        phone: '1588-6565',
      },
    ],
  },
  low: {
    analysis: '안타까운 달성률입니다. 외부의 조력이 필요합니다.',
    advice:
      '컨설팅 및 상담이 필요할 것 같습니다. 아래 상담을 요청해 보시기를 추천드립니다.',
    agencies: [
      {name: '소상공인진흥센터', url: 'https://www.sbiz.or.kr/', phone: '1357'},
      {
        name: '서울산업진흥원',
        url: 'https://www.sba.seoul.kr/',
        phone: '1644-3940',
      },
      {
        name: '중소기업유통센터',
        url: 'https://www.sbdc.or.kr/',
        phone: '02-6678-9563',
      },
      {
        name: '지역신용보증재단',
        url: 'https://www.koreg.or.kr/',
        phone: '1577-5900',
      },
    ],
  },
  mid: {
    analysis: '목표 대비 부족한 부분이 있습니다. 개선이 필요합니다.',
    advice: '실적 개선을 위하여 마케팅, 홍보 등의 지원을 받으시기를 추천합니다',
    agencies: [
      {
        name: '중소기업진흥공단',
        url: 'https://www.kosmes.or.kr/',
        phone: '1357',
      },
      {
        name: '대한상공회의소',
        url: 'https://www.korcham.net/',
        phone: '02-6050-3114',
      },
      {
        name: '한국여성경제인협회',
        url: 'https://www.womanbiz.or.kr/',
        phone: '02-369-0900',
      },
      {name: '소상공인마당', url: 'https://www.sbiz.or.kr/', phone: '1357'},
    ],
  },

  high: {
    analysis: '매우 높은 달성률입니다.',
    advice: '꾸준히 계속 유지하시기 바랍니다.',
    agencies: [
      {
        name: '대한상공회의소',
        url: 'https://www.korcham.net/',
        phone: '02-6050-3114',
      },
      {
        name: '중소기업진흥공단',
        url: 'https://www.kosmes.or.kr/',
        phone: '1357',
      },
      {
        name: '소상공인시장진흥공단',
        url: 'https://www.semas.or.kr/',
        phone: '1357',
      },
      {
        name: '한국세무사회',
        url: 'https://www.kacpta.or.kr/',
        phone: '02-6011-1777',
      },
    ],
  },
};
