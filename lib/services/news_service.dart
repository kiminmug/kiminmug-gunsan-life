import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/news_model.dart';

/// 뉴스 서비스 - RSS 피드 파싱
class NewsService {
  // 투데이군산 RSS
  static const String _todayGunsanRss = 'http://www.todaygunsan.co.kr/rss/S1N1.xml';
  
  // Google News RSS (군산 키워드)
  static const String _googleNewsRss = 'https://news.google.com/rss/search?q=%EA%B5%B0%EC%82%B0&hl=ko&gl=KR&ceid=KR:ko';
  
  // CORS 프록시 (웹에서 사용 시)
  static const String _corsProxy = 'https://api.allorigins.win/raw?url=';

  /// 군산 지역 뉴스 가져오기
  Future<List<NewsItem>> getLocalNews({bool useProxy = true}) async {
    try {
      String url = _todayGunsanRss;
      if (useProxy) {
        url = '$_corsProxy${Uri.encodeComponent(_todayGunsanRss)}';
      }
      
      final response = await http.get(
        Uri.parse(url),
        headers: {'Accept': 'application/xml, text/xml, */*'},
      ).timeout(const Duration(seconds: 15));
      
      if (response.statusCode == 200) {
        return _parseRssXml(response.body, '투데이군산');
      }
    } catch (e) {
      // 실패 시 Google News로 폴백
    }
    
    return getGoogleNews(useProxy: useProxy);
  }

  /// Google News에서 군산 뉴스 검색
  Future<List<NewsItem>> getGoogleNews({bool useProxy = true}) async {
    try {
      String url = _googleNewsRss;
      if (useProxy) {
        url = '$_corsProxy${Uri.encodeComponent(_googleNewsRss)}';
      }
      
      final response = await http.get(
        Uri.parse(url),
        headers: {'Accept': 'application/xml, text/xml, */*'},
      ).timeout(const Duration(seconds: 15));
      
      if (response.statusCode == 200) {
        return _parseGoogleNewsRss(response.body);
      }
    } catch (e) {
      // 무시
    }
    
    return NewsItem.getSampleNews();
  }

  /// RSS XML 파싱 (일반)
  List<NewsItem> _parseRssXml(String xmlString, String defaultSource) {
    final items = <NewsItem>[];
    
    try {
      // 간단한 XML 파싱 (정규식 사용)
      final itemRegex = RegExp(r'<item>(.*?)</item>', dotAll: true);
      final matches = itemRegex.allMatches(xmlString);
      
      int index = 0;
      for (final match in matches) {
        if (index >= 15) break; // 최대 15개
        
        final itemXml = match.group(1) ?? '';
        
        final title = _extractTag(itemXml, 'title');
        final link = _extractTag(itemXml, 'link');
        final description = _extractTag(itemXml, 'description');
        final pubDate = _extractTag(itemXml, 'pubDate');
        final author = _extractTag(itemXml, 'author') ?? 
                       _extractTag(itemXml, 'dc:creator') ?? 
                       defaultSource;
        
        if (title.isNotEmpty) {
          items.add(NewsItem(
            id: 'news-$index',
            title: _cleanHtml(title),
            summary: _cleanHtml(description).length > 100 
                ? '${_cleanHtml(description).substring(0, 100)}...'
                : _cleanHtml(description),
            source: author,
            url: link,
            date: _parseDate(pubDate),
          ));
          index++;
        }
      }
    } catch (e) {
      // 파싱 에러
    }
    
    return items.isEmpty ? NewsItem.getSampleNews() : items;
  }

  /// Google News RSS 파싱
  List<NewsItem> _parseGoogleNewsRss(String xmlString) {
    final items = <NewsItem>[];
    
    try {
      final itemRegex = RegExp(r'<item>(.*?)</item>', dotAll: true);
      final matches = itemRegex.allMatches(xmlString);
      
      int index = 0;
      for (final match in matches) {
        if (index >= 15) break;
        
        final itemXml = match.group(1) ?? '';
        
        var title = _extractTag(itemXml, 'title');
        final link = _extractTag(itemXml, 'link');
        final pubDate = _extractTag(itemXml, 'pubDate');
        
        // Google News 제목에서 언론사 추출 (제목 - 언론사 형식)
        String source = 'Google News';
        final dashIndex = title.lastIndexOf(' - ');
        if (dashIndex > 0) {
          source = title.substring(dashIndex + 3);
          title = title.substring(0, dashIndex);
        }
        
        if (title.isNotEmpty) {
          items.add(NewsItem(
            id: 'gnews-$index',
            title: _cleanHtml(title),
            summary: '군산 관련 뉴스입니다. 자세한 내용은 기사를 확인하세요.',
            source: source,
            url: link,
            date: _parseDate(pubDate),
          ));
          index++;
        }
      }
    } catch (e) {
      // 파싱 에러
    }
    
    return items.isEmpty ? NewsItem.getSampleNews() : items;
  }

  /// XML 태그 내용 추출
  String _extractTag(String xml, String tagName) {
    // CDATA 섹션 처리
    final cdataRegex = RegExp('<$tagName><!\\[CDATA\\[(.+?)\\]\\]></$tagName>', dotAll: true);
    final cdataMatch = cdataRegex.firstMatch(xml);
    if (cdataMatch != null) {
      return cdataMatch.group(1)?.trim() ?? '';
    }
    
    // 일반 태그
    final regex = RegExp('<$tagName>(.+?)</$tagName>', dotAll: true);
    final match = regex.firstMatch(xml);
    return match?.group(1)?.trim() ?? '';
  }

  /// HTML 태그 제거
  String _cleanHtml(String html) {
    return html
        .replaceAll(RegExp(r'<[^>]*>'), '')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .trim();
  }

  /// 날짜 파싱
  String _parseDate(String dateStr) {
    try {
      if (dateStr.isEmpty) {
        final now = DateTime.now();
        return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      }
      
      // RFC 2822 형식 파싱 (예: "Fri, 20 Dec 2024 10:30:00 +0900")
      final parsed = _parseRfc2822(dateStr);
      if (parsed != null) {
        return '${parsed.year}-${parsed.month.toString().padLeft(2, '0')}-${parsed.day.toString().padLeft(2, '0')}';
      }
      
      // ISO 8601 형식 시도
      final iso = DateTime.tryParse(dateStr);
      if (iso != null) {
        return '${iso.year}-${iso.month.toString().padLeft(2, '0')}-${iso.day.toString().padLeft(2, '0')}';
      }
    } catch (e) {
      // 무시
    }
    
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  /// RFC 2822 날짜 파싱
  DateTime? _parseRfc2822(String dateStr) {
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
        final year = int.parse(match.group(3)!);
        return DateTime(year, month, day);
      }
    } catch (e) {
      // 무시
    }
    return null;
  }

  /// 지역 이벤트 가져오기 (군산시 행사 정보)
  Future<List<LocalEvent>> getLocalEvents() async {
    // 실제로는 군산시청 API나 공공데이터 연동 필요
    // 현재는 샘플 데이터 반환
    return LocalEvent.getSampleEvents();
  }
}
