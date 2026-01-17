/// 뉴스 데이터 모델

class NewsItem {
  final String id;
  final String title;
  final String summary;
  final String source;
  final String url;
  final String date;
  final String? imageUrl;
  final String category;
  
  NewsItem({
    required this.id,
    required this.title,
    required this.summary,
    required this.source,
    required this.url,
    required this.date,
    this.imageUrl,
    this.category = '뉴스',
  });
  
  factory NewsItem.fromJson(Map<String, dynamic> json) {
    return NewsItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      summary: json['summary'] ?? '',
      source: json['source'] ?? '',
      url: json['url'] ?? '',
      date: json['date'] ?? '',
      imageUrl: json['imageUrl'],
      category: json['category'] ?? '뉴스',
    );
  }
  
  // 샘플 뉴스 데이터
  static List<NewsItem> getSampleNews() {
    return [
      NewsItem(
        id: '1',
        title: '군산시, 내년 국가예산 확보 총력전... 국회 방문',
        summary: '군산시가 내년도 국가예산 확보를 위해 국회를 방문하여 주요 사업 예산 반영을 요청했습니다.',
        source: '전북일보',
        url: 'https://www.jjan.kr',
        date: '2024-12-20',
      ),
      NewsItem(
        id: '2',
        title: '군산 은파호수공원, 맨발 걷기 산책로 조성 완료',
        summary: '시민들의 건강 증진을 위한 맨발 걷기 산책로가 은파호수공원에 새롭게 조성되었습니다.',
        source: '군산미래신문',
        url: 'http://www.kmrnews.com',
        date: '2024-12-19',
      ),
      NewsItem(
        id: '3',
        title: 'HD현대인프라코어 군산공장, 지역 소외계층에 쌀 기탁',
        summary: 'HD현대인프라코어가 연말을 맞아 군산 지역 소외계층을 위해 쌀 1000포를 기탁했습니다.',
        source: '투데이군산',
        url: 'http://www.todaygunsan.co.kr',
        date: '2024-12-18',
      ),
      NewsItem(
        id: '4',
        title: '새만금 이차전지 특화단지, 투자 유치 순항 중',
        summary: '새만금 이차전지 특화단지에 대기업들의 투자가 이어지며 지역 경제 활성화 기대감이 높아지고 있습니다.',
        source: '연합뉴스',
        url: 'https://www.yna.co.kr',
        date: '2024-12-17',
      ),
      NewsItem(
        id: '5',
        title: '군산 선유도 해수욕장, 관광객 편의 시설 대폭 확충',
        summary: '선유도 해수욕장의 샤워실, 탈의실 등 편의시설이 대폭 확충되어 관광객 만족도가 높아질 전망입니다.',
        source: '노컷뉴스',
        url: 'https://www.nocutnews.co.kr',
        date: '2024-12-16',
      ),
    ];
  }
}

/// 지역 행사/이벤트 모델
class LocalEvent {
  final String id;
  final String title;
  final String dateRange;
  final String location;
  final String type; // 'Festival', 'Culture', 'Notice'
  final String description;
  final String? contact;
  
  LocalEvent({
    required this.id,
    required this.title,
    required this.dateRange,
    required this.location,
    required this.type,
    required this.description,
    this.contact,
  });
  
  String get typeLabel {
    switch (type) {
      case 'Festival':
        return '공연/영화';
      case 'Culture':
        return '전시회';
      case 'Notice':
        return '일반행사';
      default:
        return '기타';
    }
  }
  
  // 샘플 이벤트 데이터
  static List<LocalEvent> getSampleEvents() {
    return [
      LocalEvent(
        id: 'e-1225',
        title: '스노우버블쇼',
        dateRange: '12.25(수)',
        location: '예술의전당 대공연장',
        type: 'Festival',
        description: '크리스마스를 맞아 온 가족이 즐길 수 있는 환상적인 버블 퍼포먼스',
      ),
      LocalEvent(
        id: 'e-1227',
        title: '(사)군산시민오케스트라 제10회 정기연주회',
        dateRange: '12.27(금)',
        location: '예술의전당 대공연장',
        type: 'Culture',
        description: '군산 시민들로 구성된 오케스트라의 제10회 정기 연주회',
      ),
      LocalEvent(
        id: 'e-1229',
        title: '조촌동 행정복지센터 신청사 업무 개시',
        dateRange: '12.29(일)',
        location: '조촌동 신청사 (부골1길 40)',
        type: 'Notice',
        description: '조촌동 행정복지센터가 새로운 청사로 이전하여 업무 시작',
      ),
      LocalEvent(
        id: 'e-1218',
        title: '군산시립예술단 <송년 음악회>',
        dateRange: '12.18(수)',
        location: '예술의전당 대공연장',
        type: 'Culture',
        description: '교향악단과 합창단이 함께하여 한 해를 마무리하는 웅장한 합동 공연',
      ),
    ];
  }
}
