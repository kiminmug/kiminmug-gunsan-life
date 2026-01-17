import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:flutter/foundation.dart';

/// Gemini AI 서비스 - AI 비서 및 브리핑 생성
class GeminiService {
  GenerativeModel? _model;
  ChatSession? _chatSession;
  
  // API 키 (실제 앱에서는 환경변수나 보안 저장소 사용)
  String? _apiKey;
  
  /// 초기화
  Future<void> initialize(String apiKey) async {
    if (apiKey.isEmpty) {
      if (kDebugMode) {
        print('Gemini API key is empty');
      }
      return;
    }
    
    _apiKey = apiKey;
    
    try {
      _model = GenerativeModel(
        model: 'gemini-1.5-flash',
        apiKey: apiKey,
        generationConfig: GenerationConfig(
          temperature: 0.7,
          maxOutputTokens: 1024,
        ),
        systemInstruction: Content.text('''
당신은 전라북도 군산시에 거주하는 주민들을 위한 친절한 '군산 AI 비서'입니다.

역할:
- 군산 사투리를 아주 살짝 섞어서 친근하게 답변하세요 (예: ~유, ~구만유, ~해유)
- 관광객이 아닌 거주민에게 필요한 실생활 정보를 제공하세요
- 군산의 지역 특성(항구 도시, 근대 문화유산, 새만금 등)을 잘 알고 있습니다
- 모르는 것은 솔직히 모른다고 하되, 관련 정보를 찾아볼 수 있는 방법을 안내하세요

알고 있는 정보:
- 군산 주요 관광지: 경암동 철길마을, 근대역사박물관, 선유도, 은파호수공원
- 맛집 거리: 짬뽕거리, 이성당 빵집
- 주요 기관: 군산시청, 군산의료원, 군산소방서
- 새만금 개발 현황 및 계획
- 지역 축제 및 행사 정보

답변 스타일:
- 친근하고 따뜻하게
- 구체적이고 실용적인 정보 제공
- 필요시 이모지 사용 가능
- 답변은 간결하게 (2-3문장 정도)
'''),
      );
      
      // 채팅 세션 시작
      _chatSession = _model!.startChat();
      
      if (kDebugMode) {
        print('Gemini service initialized successfully');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to initialize Gemini: $e');
      }
    }
  }
  
  /// API 키 설정 여부 확인
  bool get isInitialized => _model != null && _apiKey != null;
  
  /// 채팅 메시지 전송
  Future<String> sendMessage(String message) async {
    if (!isInitialized || _chatSession == null) {
      return _getOfflineResponse(message);
    }
    
    try {
      final response = await _chatSession!.sendMessage(
        Content.text(message),
      );
      
      final responseText = response.text;
      if (responseText != null && responseText.isNotEmpty) {
        return responseText;
      }
      
      return '죄송해유, 답변을 생성하지 못했어유. 다시 한번 물어봐 주세유.';
    } catch (e) {
      if (kDebugMode) {
        print('Gemini chat error: $e');
      }
      return _getOfflineResponse(message);
    }
  }
  
  /// 오늘의 브리핑 생성
  Future<String> generateDailyBriefing({
    required String weatherInfo,
    List<String>? newsHeadlines,
  }) async {
    if (!isInitialized) {
      return _getDefaultBriefing(weatherInfo);
    }
    
    try {
      final now = DateTime.now();
      final dateStr = '${now.year}년 ${now.month}월 ${now.day}일';
      
      final newsSection = newsHeadlines != null && newsHeadlines.isNotEmpty
          ? '주요 뉴스:\n${newsHeadlines.take(3).map((n) => '- $n').join('\n')}'
          : '';
      
      final prompt = '''
오늘은 $dateStr입니다.

현재 군산 날씨 정보:
$weatherInfo

$newsSection

위 정보를 바탕으로 군산 시민을 위한 오늘의 브리핑을 작성해주세요.

포함할 내용:
1. 오늘 날씨 요약 및 생활 팁
2. 뉴스가 있다면 주요 소식 한 줄 요약
3. 군산 사투리가 살짝 섞인 따뜻한 응원 한마디

형식: 자연스러운 문단 형태로, 총 4-5문장 정도로 간결하게
''';
      
      final response = await _model!.generateContent([
        Content.text(prompt),
      ]);
      
      final responseText = response.text;
      if (responseText != null && responseText.isNotEmpty) {
        return responseText;
      }
    } catch (e) {
      if (kDebugMode) {
        print('Gemini briefing error: $e');
      }
    }
    
    return _getDefaultBriefing(weatherInfo);
  }
  
  /// 채팅 세션 초기화 (새 대화 시작)
  void resetChat() {
    if (_model != null) {
      _chatSession = _model!.startChat();
    }
  }
  
  /// 오프라인/에러 시 기본 응답
  String _getOfflineResponse(String query) {
    final lowerQuery = query.toLowerCase();
    
    if (lowerQuery.contains('날씨')) {
      return '오늘 군산 날씨는 앱 홈 화면에서 확인하실 수 있어유! 날씨 탭을 눌러보세유. 🌤️';
    } else if (lowerQuery.contains('맛집') || lowerQuery.contains('먹')) {
      return '군산 맛집이라면 짬뽕거리를 추천해 드릴게유! 빈해원, 복성루가 유명하구유. 이성당 빵집 단팥빵도 꼭 드셔보세유! 🍜🥖';
    } else if (lowerQuery.contains('관광') || lowerQuery.contains('가볼')) {
      return '군산 관광지로는 경암동 철길마을, 근대역사박물관, 선유도가 인기 있어유. 은파호수공원 물빛다리 야경도 예쁘구만유! 🏛️✨';
    } else if (lowerQuery.contains('버스') || lowerQuery.contains('교통')) {
      return '군산 시내버스는 카드 결제하시면 환승 할인이 되유. 실시간 버스 정보는 \'카카오맵\'이나 \'네이버 지도\' 앱에서 확인하시면 되유! 🚌';
    } else if (lowerQuery.contains('병원') || lowerQuery.contains('응급')) {
      return '응급 상황이시면 119로 전화하시구유, 군산의료원 응급실(063-472-5000)이나 동군산병원 응급실(063-440-0300)로 가시면 되유! 🏥';
    } else if (lowerQuery.contains('시청') || lowerQuery.contains('민원')) {
      return '군산시청 대표번호는 063-454-2114이구유, 민원실은 063-454-4000이에유. 시청 홈페이지에서 온라인 민원도 가능해유! 🏢';
    } else {
      return '아이고, 그 부분은 제가 좀 더 알아봐야겠네유. 군산 날씨, 맛집, 관광지, 긴급 연락처는 잘 알고 있으니까 편하게 물어봐 주세유! 😊';
    }
  }
  
  /// 기본 브리핑 생성
  String _getDefaultBriefing(String weatherInfo) {
    final now = DateTime.now();
    final greeting = _getTimeGreeting(now.hour);
    
    return '''$greeting 군산 시민 여러분!

$weatherInfo

오늘도 활기찬 하루 보내시길 바랍니다. 궁금한 게 있으시면 AI 비서에게 물어봐 주세유! 🌊''';
  }
  
  String _getTimeGreeting(int hour) {
    if (hour < 12) return '좋은 아침이에유!';
    if (hour < 18) return '좋은 오후에유!';
    return '좋은 저녁이에유!';
  }
}

/// 싱글톤 인스턴스
final geminiService = GeminiService();
