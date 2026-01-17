/// 군산 Life 앱 상수 정의

class AppConstants {
  // App Info
  static const String appName = '군산 Life';
  static const String appVersion = '1.0.0';
  static const String appUrl = 'https://gunsannews.net';
  
  // API Endpoints (예시 - 실제 API로 교체 필요)
  static const String weatherApiUrl = 'https://api.openweathermap.org/data/2.5';
  static const String newsRssUrl = 'http://www.todaygunsan.co.kr/rss/S1N1.xml';
  
  // Location
  static const double gunsanLat = 35.9676;
  static const double gunsanLng = 126.7369;
  static const String gunsanCityName = '군산시';
}

/// 긴급 연락처 데이터
class EmergencyContact {
  final String name;
  final String phone;
  final String category;
  
  const EmergencyContact({
    required this.name,
    required this.phone,
    required this.category,
  });
}

const List<EmergencyContact> emergencyContacts = [
  // 행정/민원
  EmergencyContact(name: '군산시청 민원실', phone: '063-454-4000', category: 'Admin'),
  EmergencyContact(name: '군산시청 대표번호', phone: '063-454-2114', category: 'Admin'),
  
  // 안전/치안
  EmergencyContact(name: '군산 경찰서', phone: '063-441-0324', category: 'Safety'),
  EmergencyContact(name: '군산 소방서', phone: '063-450-9119', category: 'Safety'),
  EmergencyContact(name: '군산 해양경찰서', phone: '063-440-7501', category: 'Safety'),
  
  // 병원/의료
  EmergencyContact(name: '군산시 보건소', phone: '063-463-4000', category: 'Medical'),
  EmergencyContact(name: '군산 의료원 (응급실)', phone: '063-472-5000', category: 'Medical'),
  EmergencyContact(name: '동군산 병원 (응급실)', phone: '063-440-0300', category: 'Medical'),
  EmergencyContact(name: '원광대병원 군산', phone: '063-460-2000', category: 'Medical'),
];

/// 뉴스 카테고리
class NewsCategory {
  final String name;
  final String label;
  final List<NewsSource> sources;
  
  const NewsCategory({
    required this.name,
    required this.label,
    required this.sources,
  });
}

class NewsSource {
  final String name;
  final String url;
  
  const NewsSource({required this.name, required this.url});
}

const List<NewsCategory> newsCategories = [
  NewsCategory(
    name: 'local',
    label: '군산 지역',
    sources: [
      NewsSource(name: '투데이군산', url: 'http://www.todaygunsan.co.kr'),
      NewsSource(name: '군산미래신문', url: 'http://www.kmrnews.com'),
      NewsSource(name: '군산신문', url: 'http://www.gunsanews.com'),
      NewsSource(name: '새군산신문', url: 'http://www.newgunsan.kr'),
    ],
  ),
  NewsCategory(
    name: 'jeonbuk',
    label: '전북권',
    sources: [
      NewsSource(name: '전북일보', url: 'https://www.jjan.kr'),
      NewsSource(name: '전라일보', url: 'http://www.jeollailbo.com'),
      NewsSource(name: '전북도민일보', url: 'http://www.domin.co.kr'),
      NewsSource(name: '새만금일보', url: 'https://www.smgnews.co.kr'),
    ],
  ),
];

/// 지역 생활 꿀팁
const List<String> localTips = [
  "💡 군산사랑상품권은 월초에 구매하면 10% 할인을 받을 수 있어요.",
  "💡 이성당 빵집은 평일 오전 10시 이전이 가장 한가해요.",
  "💡 은파호수공원 야경은 물빛다리 조명이 켜지는 일몰 직후가 가장 예뻐요.",
  "💡 군산 짬뽕거리는 점심시간을 피해 2시 이후에 가면 웨이팅이 적어요.",
  "💡 선유도 배편은 성수기에 미리 예약하지 않으면 못 탈 수 있어요.",
  "💡 군산 시내버스는 카드 승차 시 환승 할인이 적용돼요.",
];

/// 새만금 개발 현황 (샘플)
class SaemangeumProject {
  final String title;
  final int progress;
  final String status;
  final String description;
  
  const SaemangeumProject({
    required this.title,
    required this.progress,
    required this.status,
    required this.description,
  });
}

const List<SaemangeumProject> saemangeumProjects = [
  SaemangeumProject(
    title: '스마트 수변도시',
    progress: 85,
    status: '진행중',
    description: '친환경 스마트시티 조성 사업',
  ),
  SaemangeumProject(
    title: '새만금 국제공항',
    progress: 40,
    status: '설계중',
    description: '국제선 운항 가능 공항 건설',
  ),
  SaemangeumProject(
    title: '신항만 크루즈 부두',
    progress: 20,
    status: '초기단계',
    description: '대형 크루즈 선박 접안 시설',
  ),
];
