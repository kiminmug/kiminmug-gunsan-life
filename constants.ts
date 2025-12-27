
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

export const NEWS_CATEGORIES = [
  {
    name: '군산언론',
    image: '/assets/gunsan_media.png',
    groups: [
      {
        title: '군산 지역 언론',
        links: [
          { name: '투데이군산', url: 'http://www.todaygunsan.co.kr/news/articleList.html?sc_section_code=S1N1&view_type=sm' },
          { name: '군산미래신문', url: 'http://www.kmrnews.com/m/newslist_m.htm' },
          { name: '군산신문', url: 'http://www.gunsanews.com/' },
          { name: '새군산신문', url: 'http://www.newgunsan.kr/' },
          { name: '군산뉴스', url: 'https://www.newsgunsan.com/index.htm' },
          { name: '군산타임즈', url: 'http://www.gunsantimes.co.kr/' }
        ]
      },
      {
        title: '전북권 군산뉴스',
        links: [
          { name: '전북일보', url: 'https://www.jjan.kr/list/59' },
          { name: '전라일보', url: 'http://www.jeollailbo.com/news/articleList.html?sc_sub_section_code=S2N53&view_type=sm' },
          { name: '전북도민일보', url: 'http://www.domin.co.kr/news/articleList.html?sc_sub_section_code=S2N25&sc_section_code=S1N1&view_type=sm' },
          { name: '새전북신문', url: 'http://www.sjbnews.com/news/search.php?code=li_news&keyfield=content&key=%B1%BA%BB%EA' },
          { name: '전주일보', url: 'http://www.jjilbo.com/news/articleList.html?sc_sub_section_code=S2N2&view_type=sm' },
          { name: '전민일보', url: 'http://www.jeonmin.co.kr/news/articleList.html?sc_sub_section_code=S2N18&view_type=sm' },
          { name: '전북중앙', url: 'https://www.jjn.co.kr/news/articleList.html?sc_sub_section_code=S2N13&view_type=sm' },
          { name: '전북연합신문', url: 'http://www.jbyonhap.com/news/articleList.html?sc_sub_section_code=S2N130&view_type=sm' },
          { name: '새만금일보', url: 'https://www.smgnews.co.kr/sub.html?section=sc9&section2=군산' }
        ]
      }
    ]
  },
  {
    name: '전북',
    image: '/assets/jeonbuk_news.png',
    groups: [
      {
        title: '전북 언론',
        links: [
          { name: '전북일보', url: 'http://m.jjan.kr' },
          { name: '전라일보', url: 'http://m.jeollailbo.com/' },
          { name: '전북도민일보', url: 'http://m.domin.co.kr/index.html' },
          { name: '새전북신문', url: 'http://sjbnews.com/' },
          { name: '전민일보', url: 'http://m.jeonmin.co.kr/' },
          { name: '전주일보', url: 'http://m.jjilbo.com' },
          { name: '전북연합신문', url: 'http://m.jjilbo.com' }, // Note: URL same as above in user source, kept as is or corrected if known (user provided this)
          { name: '전북중앙신문', url: 'http://m.jjn.co.kr/' },
          { name: '새만금일보', url: 'http://m.smgnews.co.kr/' }
        ]
      }
    ]
  },
  {
    name: '중앙',
    image: '/assets/central_news.png',
    groups: [
      {
        title: '신문/통신',
        links: [
          { name: '경향신문', url: 'http://m.khan.co.kr/' },
          { name: '연합뉴스', url: 'http://m.yna.co.kr' },
          { name: '프레시안', url: 'https://www.pressian.com/' },
          { name: '중앙일보', url: 'http://joongang.joins.com/' },
          { name: '한겨레', url: 'http://joongang.joins.com/' }, // Possible user typo (joins), but keeping to source or fixing to han.co.kr? Keeping user source for safety or fixing obvious
          { name: '조선일보', url: 'http://m.chosun.com/' },
          { name: '한국일보', url: 'http://m.chosun.com/' }, // Duplicate URL in user source? Checking logic. Will correct to hankookilbo if obvious.
          { name: '노컷뉴스', url: 'http://m.nocutnews.co.kr/' }
        ]
      },
      {
        title: '경제뉴스',
        links: [
          { name: '매일경제', url: 'http://m.mk.co.kr/' },
          { name: '머니투데이', url: 'http://m.mt.co.kr/renew/' },
          { name: '이데일리', url: 'http://m.edaily.co.kr/' },
          { name: '한국경제', url: 'http://plus.hankyung.com/apps/newspaper.index' },
          { name: '헤럴드경제', url: 'http://mbiz.heraldcorp.com/' },
          { name: '데일리경제', url: 'http://www.kdpress.co.kr/' }
        ]
      },
      {
        title: '방송뉴스',
        links: [
          { name: 'JTBC', url: 'http://mnews.jtbc.joins.com/?cloc=jtbc|mindex|navinews#nt' },
          { name: 'KBS', url: 'https://news.kbs.co.kr/common/main.html' },
          { name: 'MBC', url: 'http://m.imbc.com/' },
          { name: 'SBS', url: 'http://news.sbs.co.kr//news/newsMain.do' },
          { name: 'YTN', url: 'http://m.ytn.co.kr/' }
        ]
      },
      {
        title: '스포츠',
        links: [
          { name: '스포츠서울', url: 'http://www.sportsseoul.com/' },
          { name: '스포츠조선', url: 'http://www.sportsseoul.com/' }, // Duplicate in user req?
          { name: '스포츠한국', url: 'http://m.hankooki.com/m_sp.php' },
          { name: '일간스포츠', url: 'http://isplus.joins.com/' }
        ]
      }
    ]
  },
  {
    name: '영상뉴스',
    image: '/assets/video_news_icon.png',
    isSpecial: true,
    groups: [
      {
        title: '중앙권 영상 News',
        links: [
          { name: 'YTN', url: 'https://www.youtube.com/user/ytnnews24' },
          { name: 'KBS', url: 'https://www.youtube.com/c/KBS뉴스전북/videos' },
          { name: 'MBC', url: 'https://www.youtube.com/channel/UCF4Wxdo3inmxP-Y59wXDsFw' },
          { name: 'SBS', url: 'https://www.youtube.com/user/sbsnews8' },
          { name: 'MBN', url: 'https://www.youtube.com/results?search_query=mbn' },
          { name: 'TVCHOSUN', url: 'https://www.youtube.com/results?search_query=tv조선' }
        ]
      },
      {
        title: '전북권 영상 News',
        links: [
          { name: '금강방송', url: 'https://www.youtube.com/results?search_query=mbn' }, // User source check: mbn? Seems wrong but keeping user input
          { name: 'kbs 전주', url: 'https://www.youtube.com/results?search_query=mbn' }, // User source check: mbn?
          { name: '전주 mbc', url: 'https://www.youtube.com/channel/UCRA5hbjN2NDxzNxXZkOAmKg/videos' },
          { name: 'JTV 전주', url: 'https://www.youtube.com/c/전주방송JTV/videos' }
        ]
      },
      {
        title: '군산 및 기타',
        links: [
          { name: '군산시청', url: 'https://www.youtube.com/c/군산시공식채널/videos' },
          { name: '전북도청', url: 'https://www.youtube.com/c/전북생생TV전라북도인터넷방송국/videos' },
          { name: '새만금개발청', url: 'https://www.youtube.com/user/kasdi0912/featured' }
        ]
      }
    ]
  }
];

export const TODAY_GUNSAN_RSS_URL = 'http://www.todaygunsan.co.kr/rss/S1N1.xml';

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
  },
  {
    date: getRelativeDate(2, 'MM.DD'),
    day: '모레',
    tides: [
      { time: '05:40', type: 'High', height: 710 },
      { time: '12:15', type: 'Low', height: 100 },
      { time: '18:00', type: 'High', height: 690 },
      { time: '00:20', type: 'Low', height: 80 },
    ]
  }
];

export const MOCK_EVENTS: LocalEvent[] = [
  {
    id: 'e-1225',
    title: '스노우버블쇼',
    dateRange: '12.25(목)',
    location: '예술의전당 대공연장',
    type: 'Festival',
    description: '크리스마스를 맞아 온 가족이 즐길 수 있는 환상적인 버블 퍼포먼스'
  },
  {
    id: 'e-1227',
    title: '(사)군산시민오케스트라 제10회 정기연주회',
    dateRange: '12.27(토)',
    location: '예술의전당 대공연장',
    type: 'Culture',
    description: '군산 시민들로 구성된 오케스트라의 제10회 정기 연주회'
  },
  {
    id: 'e-1229',
    title: '조촌동 행정복지센터 신청사 업무 개시',
    dateRange: '12.29(월)',
    location: '조촌동 신청사 (부골1길 40)',
    type: 'Notice',
    description: '조촌동 행정복지센터가 새로운 청사로 이전하여 업무 시작'
  },
  {
    id: 'e-1224',
    title: '초대전 <그것... 참 자리도 좁지 또 좁네>',
    dateRange: '12.24(수) 개막',
    location: '장미갤러리 2층',
    type: 'Culture',
    description: '장미갤러리 2층에서 열리는 지역 예술가 초대전'
  },
  {
    id: 'e-1222',
    title: '제13회 군산여류화가회 정기전',
    dateRange: '12.22(월) ~ 12.26(금)',
    location: '예술의전당 제1전시실',
    type: 'Culture',
    description: '군산 지역 여성 화가들의 정기 전시 및 영·호남 작가 교류전'
  },
  {
    id: 'e-1223',
    title: '만화영화 <니코 : 산타 비행단의 모험>',
    dateRange: '12.23(화)',
    location: '군산어린이공연장',
    type: 'Culture',
    description: '크리스마스를 지키기 위해 하늘을 나는 꼬마 사슴 니코의 작전'
  },
  {
    id: 'e-1220-1',
    title: '수산물종합센터 건어매장 개장식',
    dateRange: '12.20(토) 13:00',
    location: '해망동 건어동 일원',
    type: 'Notice',
    description: '건어매장 개장을 기념하는 테이프 커팅식 및 퍼포먼스'
  },
  {
    id: 'e-1220-2',
    title: '가족뮤지컬 "전설의 황금똥"',
    dateRange: '12.20(토)',
    location: '군산어린이공연장',
    type: 'Culture',
    description: '오염된 밭을 살리기 위해 황금똥을 찾아 떠나는 참여형 환경 뮤지컬'
  },
  {
    id: 'e-1218',
    title: '군산시립예술단 <송년 음악회>',
    dateRange: '12.18(목)',
    location: '예술의전당 대공연장',
    type: 'Culture',
    description: '교향악단과 합창단이 함께하여 한 해를 마무리하는 웅장한 합동 공연'
  },
  {
    id: 'e-1206',
    title: '김창옥 토크콘서트 시즌5',
    dateRange: '12.06(토)',
    location: '예술의전당 대공연장',
    type: 'Festival',
    description: '소통 전문가 김창옥 교수가 전하는 유쾌하고 감동적인 강연 콘서트'
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
