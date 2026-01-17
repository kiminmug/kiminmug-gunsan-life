import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class DataService {
  // CORS 프록시 목록
  static const List<String> _corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
  ];

  /// 날씨 정보 가져오기
  Future<Map<String, dynamic>> getWeather() async {
    try {
      // wttr.in API 사용 (무료, API 키 불필요)
      final url = 'https://wttr.in/Gunsan,Korea?format=j1';
      
      for (final proxy in _corsProxies) {
        try {
          final response = await http.get(
            Uri.parse('$proxy${Uri.encodeComponent(url)}'),
            headers: {'Accept': 'application/json'},
          ).timeout(const Duration(seconds: 10));
          
          if (response.statusCode == 200) {
            final data = json.decode(response.body);
            return _parseWeatherData(data);
          }
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('날씨 로드 실패: $e');
      }
    }
    
    return _getDefaultWeather();
  }

  Map<String, dynamic> _parseWeatherData(Map<String, dynamic> data) {
    try {
      final current = data['current_condition']?[0];
      if (current == null) return _getDefaultWeather();
      
      final tempC = current['temp_C'] ?? '15';
      final humidity = current['humidity'] ?? '45';
      final windKmph = current['windspeedKmph'] ?? '10';
      final weatherDesc = current['lang_ko']?[0]?['value'] ?? 
                          current['weatherDesc']?[0]?['value'] ?? '맑음';
      
      // 풍속 km/h -> m/s 변환
      final windMs = (double.tryParse(windKmph.toString()) ?? 10) / 3.6;
      
      return {
        'temp': tempC.toString(),
        'status': _translateWeatherStatus(weatherDesc),
        'humidity': humidity.toString(),
        'wind': windMs.toStringAsFixed(1),
        'dust': '보통', // 미세먼지는 별도 API 필요
      };
    } catch (e) {
      return _getDefaultWeather();
    }
  }

  String _translateWeatherStatus(String status) {
    final statusLower = status.toLowerCase();
    if (statusLower.contains('clear') || statusLower.contains('sunny')) return '맑음';
    if (statusLower.contains('cloud') || statusLower.contains('overcast')) return '구름많음';
    if (statusLower.contains('rain') || statusLower.contains('drizzle')) return '비';
    if (statusLower.contains('snow')) return '눈';
    if (statusLower.contains('fog') || statusLower.contains('mist')) return '안개';
    if (statusLower.contains('thunder')) return '뇌우';
    return status.length > 10 ? status.substring(0, 10) : status;
  }

  Map<String, dynamic> _getDefaultWeather() {
    return {
      'temp': '12',
      'status': '맑음',
      'humidity': '55',
      'wind': '2.8',
      'dust': '보통',
    };
  }

  /// 뉴스 가져오기 (Google News RSS)
  Future<List<Map<String, dynamic>>> getNews() async {
    try {
      final rssUrl = 'https://news.google.com/rss/search?q=%EA%B5%B0%EC%82%B0&hl=ko&gl=KR&ceid=KR:ko';
      
      for (final proxy in _corsProxies) {
        try {
          final response = await http.get(
            Uri.parse('$proxy${Uri.encodeComponent(rssUrl)}'),
            headers: {'Accept': 'application/xml'},
          ).timeout(const Duration(seconds: 12));
          
          if (response.statusCode == 200 && response.body.contains('<item>')) {
            return _parseNewsRss(response.body);
          }
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('뉴스 로드 실패: $e');
      }
    }
    
    return _getDefaultNews();
  }

  List<Map<String, dynamic>> _parseNewsRss(String xmlString) {
    final items = <Map<String, dynamic>>[];
    
    try {
      final itemRegex = RegExp(r'<item>(.*?)</item>', dotAll: true);
      final matches = itemRegex.allMatches(xmlString);
      
      int index = 0;
      for (final match in matches) {
        if (index >= 10) break;
        
        final itemXml = match.group(1) ?? '';
        var title = _extractTag(itemXml, 'title');
        final link = _extractTag(itemXml, 'link');
        final pubDate = _extractTag(itemXml, 'pubDate');
        
        // Google News 제목에서 언론사 추출
        String source = 'Google News';
        final dashIndex = title.lastIndexOf(' - ');
        if (dashIndex > 0) {
          source = title.substring(dashIndex + 3).trim();
          title = title.substring(0, dashIndex).trim();
        }
        
        // 군산 관련 필터링
        if (title.isNotEmpty && _isGunsanRelated(title)) {
          items.add({
            'title': _cleanHtml(title),
            'source': source,
            'url': link,
            'date': _parseDate(pubDate),
          });
          index++;
        }
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('뉴스 파싱 에러: $e');
      }
    }
    
    return items.isEmpty ? _getDefaultNews() : items;
  }

  bool _isGunsanRelated(String title) {
    final keywords = ['군산', '새만금', '전북', '전라북도', '익산', '김제', '전주'];
    return keywords.any((k) => title.contains(k));
  }

  List<Map<String, dynamic>> _getDefaultNews() {
    final today = DateTime.now();
    final dateStr = '${today.month}.${today.day}';
    
    return [
      {'title': '군산시, 새만금 개발사업 본격 추진', 'source': '전북일보', 'url': 'https://www.jjan.kr', 'date': dateStr},
      {'title': '군산 은파호수공원 시민 휴식 공간으로 인기', 'source': '투데이군산', 'url': 'http://www.todaygunsan.co.kr', 'date': dateStr},
      {'title': '새만금 이차전지 특화단지 조성 순항', 'source': '연합뉴스', 'url': 'https://www.yna.co.kr', 'date': dateStr},
      {'title': '군산 선유도 관광객 방문 증가세', 'source': '노컷뉴스', 'url': 'https://www.nocutnews.co.kr', 'date': dateStr},
    ];
  }

  /// 물때 정보 가져오기
  Future<List<Map<String, dynamic>>> getTideInfo() async {
    // 실제 API 연동 시 한국해양과학기술원 API 사용
    // 현재는 샘플 데이터 반환
    return _getDefaultTides();
  }

  List<Map<String, dynamic>> _getDefaultTides() {
    final now = DateTime.now();
    
    return [
      {'type': '만조', 'time': '${(now.hour + 2) % 24}:30', 'height': '5.8m'},
      {'type': '간조', 'time': '${(now.hour + 8) % 24}:15', 'height': '1.2m'},
      {'type': '만조', 'time': '${(now.hour + 14) % 24}:45', 'height': '5.5m'},
      {'type': '간조', 'time': '${(now.hour + 20) % 24}:00', 'height': '1.4m'},
    ];
  }

  /// 환율/주식 정보 가져오기
  Future<Map<String, dynamic>> getMarketData() async {
    // 실시간 API 연동 시 금융 API 사용
    // 현재는 샘플 데이터 반환
    return {
      'usd_krw': {'value': '1,448', 'change': '+3.50', 'isUp': true},
      'kospi': {'value': '2,512', 'change': '+18.32', 'isUp': true},
      'kosdaq': {'value': '724', 'change': '-5.21', 'isUp': false},
    };
  }

  // 유틸리티 메서드
  String _extractTag(String xml, String tagName) {
    final cdataRegex = RegExp('<$tagName><!\\[CDATA\\[(.+?)\\]\\]></$tagName>', dotAll: true);
    final cdataMatch = cdataRegex.firstMatch(xml);
    if (cdataMatch != null) return cdataMatch.group(1)?.trim() ?? '';
    
    final regex = RegExp('<$tagName[^>]*>(.+?)</$tagName>', dotAll: true);
    final match = regex.firstMatch(xml);
    return match?.group(1)?.trim() ?? '';
  }

  String _cleanHtml(String html) {
    return html
        .replaceAll(RegExp(r'<[^>]*>'), '')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  String _parseDate(String dateStr) {
    try {
      final months = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
      };
      
      final regex = RegExp(r'(\d{1,2})\s+(\w{3})\s+(\d{4})');
      final match = regex.firstMatch(dateStr);
      
      if (match != null) {
        final day = int.parse(match.group(1)!);
        final month = months[match.group(2)] ?? 1;
        return '$month.$day';
      }
    } catch (e) {
      // ignore
    }
    
    final now = DateTime.now();
    return '${now.month}.${now.day}';
  }
}
