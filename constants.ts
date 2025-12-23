
import { EmergencyContact, NewsItem, DailyForecast, TideInfo, LocalEvent, SaemangeumUpdate } from './types';

// Helper to generate dynamic dates
const getRelativeDate = (offset: number, format: 'YYYY-MM-DD' | 'MM.DD' | 'M/D' | 'YYYY.MM' = 'YYYY-MM-DD') => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const shortMonth = d.getMonth() + 1;
  const shortDay = d.getDate();

  if (format === 'MM.DD') return `${month}.${day}`;
  if (format === 'M/D') return `${shortMonth}/${shortDay}`;
  if (format === 'YYYY.MM') return `${year}.${month}`;
  return `${year}-${month}-${day}`;
};

export const NEWSPAPER_SHORTCUTS = [
  { name: '군산미래신문', url: 'http://www.kmrnews.com/m/newslist_m.htm' },
  { name: '투데이군산', url: 'http://www.todaygunsan.co.kr/news/articleList.html?sc_section_code=S1N1&view_type=sm' },
  { name: '군산신문', url: 'http://www.gunsanews.com/' }
];

// Fallback data in case RSS fetch fails
export const FALLBACK_NEWS_DATA: NewsItem[] = [
  { title: "군산시, 내년 국가예산 확보 총력전... 국회 방문", source: "전북일보" },
  { title: "군산 은파호수공원, 맨발 걷기 산책로 조성 완료", source: "군산미래신문" },
  { title: "HD현대인프라코어 군산공장, 지역 소외계층에 쌀 기탁", source: "투데이군산" },
  { title: "군산대, '글로컬대학30' 재도전 위한 혁신안 마련", source: "뉴스1" },
  { title: "군산 짬뽕페스티벌, 전국 미식가들 '북적'", source: "전북도민일보" },
  { title: "새만금 이차전지 특화단지, 투자 유치 순항 중", source: "연합뉴스" },
  { title: "군산 선유도 해수욕장, 관광객 편의 시설 대폭 확충", source: "노컷뉴스" },
  { title: "군산시의회, 임시회 개회... 추경 예산안 심사", source: "KBS 전주" },
  { title: "군산 공항, 제주 노선 증편 요구 목소리 커져", source: "JTV" },
  { title: "군산 근대역사박물관, 주말 야간 개장 인기", source: "이뉴스투데이" },
  { title: "군산사랑상품권, 10% 할인 판매 조기 마감 임박", source: "아시아경제" },
  { title: "OCI 군산공장, 무재해 3배수 달성 기념식", source: "매일경제" },
  { title: "군산 철길마을, 레트로 감성 여행지로 각광", source: "여행신문" },
  { title: "군산 비응항, 가을 주꾸미 낚시객으로 북새통", source: "수산인신문" },
  { title: "타타대우상용차, 군산서 신형 트럭 로드쇼 개최", source: "자동차뉴스" }
].map((item, idx) => ({
  id: `fallback-${idx}`,
  title: item.title,
  category: '뉴스',
  source: item.source,
  platform: 'Google',
  originalUrl: `https://www.google.com/search?q=${encodeURIComponent(item.title)}`,
  date: getRelativeDate(idx < 5 ? 0 : -1), 
  summary: `${item.title}에 대한 주요 내용이 보도되었습니다. 자세한 내용은 기사를 확인하세요.`,
  content: ''
}));

/**
 * 영상뉴스 데이터 (금강방송 KCN 공식 유튜브 채널 기반)
 */
export const KCN_YOUTUBE_URL = "https://www.youtube.com/@kcn_official/videos";

// Fixed Type Error: Explicitly casting platform to 'KCN' literal type using 'as const' to satisfy NewsItem interface
export const VIDEO_NEWS_DATA: NewsItem[] = [
  {
    title: "KCN 금강방송 실시간 뉴스 (군산/익산)",
    summary: "군산 지역의 가장 빠른 소식, KCN 금강방송 공식 유튜브 채널에서 확인하세요.",
    originalUrl: KCN_YOUTUBE_URL,
    source: "KCN 금강방송",
    platform: "KCN" as const,
    date: "실시간",
    id: "v-kcn-main"
  },
  {
    title: "군산시 주요 시정 소식 및 지역 경제 뉴스",
    summary: "군산시의 새로운 정책과 지역 경제 활성화 소식을 영상으로 만나보세요.",
    originalUrl: KCN_YOUTUBE_URL,
    source: "KCN 금강방송",
    platform: "KCN" as const,
    date: "최근",
    id: "v-kcn-economy"
  },
  {
    title: "우리동네 화제와 사건사고 현장 리포트",
    summary: "군산 구석구석의 생생한 현장과 시민들의 목소리를 담은 리포트입니다.",
    originalUrl: KCN_YOUTUBE_URL,
    source: "KCN 금강방송",
    platform: "KCN" as const,
    date: "최근",
    id: "v-kcn-local"
  }
].map(item => ({
  ...item,
  category: '영상',
  content: '',
  imageUrl: 'https://img.youtube.com/vi/LXb3EKWsInQ/maxresdefault.jpg' // 대표 이미지
}));

export const MOCK_NEWS: NewsItem[] = [];

export const SAEMANGEUM_UPDATES: SaemangeumUpdate[] = [
  { id: 's1', title: '스마트 수변도시 매립 공사', progress: 85, status: '진행중', date: getRelativeDate(0, 'YYYY.MM') },
  { id: 's2', title: '새만금 국제공항 설계', progress: 40, status: '설계중', date: getRelativeDate(-30, 'YYYY.MM') },
  { id: 's3', title: '신항만 크루즈 부두 조성', progress: 20, status: '초기단계', date: getRelativeDate(-60, 'YYYY.MM') },
];

export const MOCK_TIDES: TideInfo[] = [
  {
    date: getRelativeDate(0, 'MM.DD'),
    day: '오늘',
    tides: [
      { time: '04:12', type: 'High', height: 680 },
      { time: '10:45', type: 'Low', height: 120 },
      { time: '16:30', type: 'High', height: 650 },
      { time: '22:50', type: 'Low', height: 90 },
    ]
  },
  {
    date: getRelativeDate(1, 'MM.DD'),
    day: '내일',
    tides: [
      { time: '04:55', type: 'High', height: 695 },
      { time: '11:30', type: 'Low', height: 110 },
      { time: '17:15', type: 'High', height: 670 },
      { time: '23:35', type: 'Low', height: 85 },
    ]
  }
];

export const MOCK_EVENTS: LocalEvent[] = [
  {
    id: 'e1',
    title: '2024 군산 시간여행 축제',
    dateRange: '10.04(금) ~ 10.06(일)',
    location: '구시청 광장 및 시간여행마을',
    type: 'Festival',
    description: '근대 역사를 테마로 한 군산의 대표 축제'
  },
  {
    id: 'e2',
    title: '은파 호수공원 버스킹',
    dateRange: '매주 토요일 19:00',
    location: '은파 수변무대',
    type: 'Culture',
    description: '지역 예술인들과 함께하는 낭만 버스킹'
  }
];

export const MOCK_FORECAST: DailyForecast[] = [
  { day: '오늘', date: getRelativeDate(0, 'M/D'), high: 24, low: 15, condition: 'Sunny', rainProbability: 0 },
  { day: '내일', date: getRelativeDate(1, 'M/D'), high: 26, low: 16, condition: 'PartlyCloudy', rainProbability: 20 }
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: '군산시청 민원실', phone: '063-454-4000', category: 'Admin' },
  { name: '군산시 보건소', phone: '063-463-4000', category: 'Medical' },
  { name: '군산 의료원 (응급실)', phone: '063-472-5000', category: 'Medical' },
  { name: '동군산 병원 (응급실)', phone: '063-440-0300', category: 'Medical' },
  { name: '군산 경찰서', phone: '063-441-0324', category: 'Safety' },
  { name: '군산 소방서', phone: '063-450-9119', category: 'Safety' },
];

export const LOCAL_TIPS = [
  "💡 군산사랑상품권은 월초에 구매하면 10% 할인을 받을 수 있어요.",
  "💡 이성당 빵집은 평일 오전 10시 이전이 가장 한가해요.",
  "💡 은파호수공원 야경은 물빛다리 조명이 켜지는 일몰 직후가 가장 예뻐요."
];
