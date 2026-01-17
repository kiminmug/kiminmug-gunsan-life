import 'package:flutter/material.dart';
import '../models/weather_model.dart';
import '../models/news_model.dart';
import '../config/constants.dart';
import '../services/weather_service.dart';
import '../services/news_service.dart';
import '../services/gemini_service.dart';
import 'dart:math';

/// 앱 전역 상태 관리 Provider
class AppProvider extends ChangeNotifier {
  // Services
  final WeatherService _weatherService = WeatherService();
  final NewsService _newsService = NewsService();
  
  // API Keys (실제 앱에서는 보안 저장소나 환경변수 사용)
  String? _geminiApiKey;
  String? _weatherApiKey;
  
  // Navigation
  int _currentTabIndex = 0;
  int get currentTabIndex => _currentTabIndex;
  
  // Weather
  WeatherData? _weather;
  WeatherData? get weather => _weather;
  bool _isWeatherLoading = true;
  bool get isWeatherLoading => _isWeatherLoading;
  
  // Forecast
  List<DailyForecast> _forecast = [];
  List<DailyForecast> get forecast => _forecast;
  
  // Tides
  List<TideInfo> _tides = [];
  List<TideInfo> get tides => _tides;
  
  // News
  List<NewsItem> _news = [];
  List<NewsItem> get news => _news;
  bool _isNewsLoading = true;
  bool get isNewsLoading => _isNewsLoading;
  
  // Events
  List<LocalEvent> _events = [];
  List<LocalEvent> get events => _events;
  
  // Daily Briefing
  String _briefing = '';
  String get briefing => _briefing;
  bool _isBriefingLoading = true;
  bool get isBriefingLoading => _isBriefingLoading;
  
  // Local Tip
  String _currentTip = '';
  String get currentTip => _currentTip;
  
  // Gemini 초기화 여부
  bool get isGeminiReady => geminiService.isInitialized;
  
  AppProvider() {
    _initialize();
  }
  
  Future<void> _initialize() async {
    _loadRandomTip();
    await Future.wait([
      loadWeather(),
      loadNews(),
      loadEvents(),
    ]);
    // 날씨와 뉴스 로드 후 브리핑 생성
    await loadBriefing();
  }
  
  /// API 키 설정
  Future<void> setApiKeys({
    String? geminiKey,
    String? weatherKey,
  }) async {
    _geminiApiKey = geminiKey;
    _weatherApiKey = weatherKey;
    
    if (geminiKey != null && geminiKey.isNotEmpty) {
      await geminiService.initialize(geminiKey);
    }
    
    // API 키 설정 후 데이터 새로고침
    await refreshAll();
  }
  
  void setTabIndex(int index) {
    _currentTabIndex = index;
    notifyListeners();
  }
  
  void _loadRandomTip() {
    final random = Random();
    _currentTip = localTips[random.nextInt(localTips.length)];
  }
  
  /// 날씨 데이터 로드 (실제 API)
  Future<void> loadWeather() async {
    _isWeatherLoading = true;
    notifyListeners();
    
    try {
      // 실제 날씨 API 호출
      final weatherData = await _weatherService.getCurrentWeather(
        serviceKey: _weatherApiKey,
      );
      
      if (weatherData != null) {
        _weather = weatherData;
      } else {
        _weather = WeatherData.sample();
      }
      
      // 주간 예보 로드
      _forecast = await _weatherService.getWeeklyForecast(
        serviceKey: _weatherApiKey,
      );
      
      // 물때 정보 로드
      _tides = await _weatherService.getTideInfo();
      
    } catch (e) {
      _weather = WeatherData.sample();
      _forecast = List.generate(3, (i) {
        final date = DateTime.now().add(Duration(days: i));
        return DailyForecast(
          day: i == 0 ? '오늘' : i == 1 ? '내일' : '모레',
          date: '${date.month}/${date.day}',
          high: 16 + i,
          low: 8 + i,
          condition: 'Sunny',
          rainProbability: i * 10,
        );
      });
      _tides = List.generate(3, (i) => TideInfo.sample(i));
    }
    
    _isWeatherLoading = false;
    notifyListeners();
  }
  
  /// 뉴스 데이터 로드 (RSS 파싱)
  Future<void> loadNews() async {
    _isNewsLoading = true;
    notifyListeners();
    
    try {
      // 실제 RSS 뉴스 가져오기
      _news = await _newsService.getLocalNews(useProxy: true);
      
      if (_news.isEmpty) {
        _news = NewsItem.getSampleNews();
      }
    } catch (e) {
      _news = NewsItem.getSampleNews();
    }
    
    _isNewsLoading = false;
    notifyListeners();
  }
  
  /// 이벤트 데이터 로드
  Future<void> loadEvents() async {
    try {
      _events = await _newsService.getLocalEvents();
      
      if (_events.isEmpty) {
        _events = LocalEvent.getSampleEvents();
      }
    } catch (e) {
      _events = LocalEvent.getSampleEvents();
    }
    notifyListeners();
  }
  
  /// 브리핑 생성 (Gemini AI)
  Future<void> loadBriefing() async {
    _isBriefingLoading = true;
    notifyListeners();
    
    try {
      // 날씨 정보 문자열 생성
      final weatherInfo = _weather != null
          ? '현재 기온 ${_weather!.temperature.toInt()}°C, ${_weather!.description}, 습도 ${_weather!.humidity}%, 미세먼지 ${_weather!.dustStatus}'
          : '날씨 정보를 불러오는 중입니다.';
      
      // 뉴스 헤드라인
      final newsHeadlines = _news.take(3).map((n) => n.title).toList();
      
      // Gemini로 브리핑 생성
      if (geminiService.isInitialized) {
        _briefing = await geminiService.generateDailyBriefing(
          weatherInfo: weatherInfo,
          newsHeadlines: newsHeadlines,
        );
      } else {
        // Gemini 미초기화 시 기본 브리핑
        _briefing = _generateDefaultBriefing(weatherInfo, newsHeadlines);
      }
    } catch (e) {
      _briefing = '오늘도 좋은 하루 되세유! 🌊';
    }
    
    _isBriefingLoading = false;
    notifyListeners();
  }
  
  /// 기본 브리핑 생성 (Gemini 없을 때)
  String _generateDefaultBriefing(String weatherInfo, List<String> newsHeadlines) {
    final now = DateTime.now();
    final buffer = StringBuffer();
    
    buffer.writeln('$weatherInfo');
    buffer.writeln();
    
    if (newsHeadlines.isNotEmpty) {
      buffer.writeln('📰 오늘의 주요 소식: ${newsHeadlines.first}');
      buffer.writeln();
    }
    
    // 시간대별 인사
    String greeting;
    if (now.hour < 12) {
      greeting = '좋은 아침이에유! 오늘 하루도 화이팅하세유! 💪';
    } else if (now.hour < 18) {
      greeting = '좋은 오후에유! 남은 하루도 힘내세유! ☀️';
    } else {
      greeting = '좋은 저녁이에유! 오늘 하루 수고 많으셨어유! 🌙';
    }
    
    buffer.write(greeting);
    
    return buffer.toString();
  }
  
  /// 전체 새로고침
  Future<void> refreshAll() async {
    _loadRandomTip();
    await Future.wait([
      loadWeather(),
      loadNews(),
      loadEvents(),
    ]);
    await loadBriefing();
  }
  
  /// AI 채팅 메시지 전송
  Future<String> sendChatMessage(String message) async {
    return await geminiService.sendMessage(message);
  }
  
  /// AI 채팅 초기화
  void resetChat() {
    geminiService.resetChat();
  }
}
