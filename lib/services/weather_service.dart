import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/weather_model.dart';

/// 날씨 서비스 - 기상청 API 및 물때 정보
class WeatherService {
  // 기상청 단기예보 API (공공데이터포털)
  // 실제 서비스키는 환경변수나 설정에서 관리해야 함
  static const String _kmaBaseUrl = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
  
  // 물때 API (국립해양조사원)
  static const String _tideBaseUrl = 'http://www.khoa.go.kr/oceangrid/grid/api/tideObsPreTab/search.do';
  
  // 군산 좌표 (기상청 격자)
  static const int _gunsanNx = 63;
  static const int _gunsanNy = 101;
  
  // 군산항 관측소 코드
  static const String _gunsanPortCode = 'DT_0004';

  /// 현재 날씨 가져오기 (기상청 초단기실황)
  Future<WeatherData?> getCurrentWeather({String? serviceKey}) async {
    try {
      // 기상청 API 호출을 위한 시간 계산
      final now = DateTime.now();
      final baseDate = _getBaseDate(now);
      final baseTime = _getBaseTime(now);
      
      // 실제 API 호출 (서비스키 필요)
      if (serviceKey != null && serviceKey.isNotEmpty) {
        final url = Uri.parse(
          '$_kmaBaseUrl/getUltraSrtNcst'
          '?serviceKey=$serviceKey'
          '&numOfRows=10'
          '&pageNo=1'
          '&dataType=JSON'
          '&base_date=$baseDate'
          '&base_time=$baseTime'
          '&nx=$_gunsanNx'
          '&ny=$_gunsanNy'
        );
        
        final response = await http.get(url).timeout(const Duration(seconds: 10));
        
        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          return _parseWeatherResponse(data);
        }
      }
      
      // API 키가 없거나 실패 시 실시간 웹 크롤링 대체
      return await _fetchWeatherFromWeb();
    } catch (e) {
      // 에러 시 기본 데이터 반환
      return _getDefaultWeather();
    }
  }

  /// 웹에서 날씨 정보 가져오기 (기상청 웹페이지)
  Future<WeatherData?> _fetchWeatherFromWeb() async {
    try {
      // 네이버 날씨 API 대체 사용 (더 안정적)
      final url = Uri.parse(
        'https://wttr.in/Gunsan,Korea?format=j1'
      );
      
      final response = await http.get(url, headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      }).timeout(const Duration(seconds: 10));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return _parseWttrResponse(data);
      }
    } catch (e) {
      // 무시
    }
    
    return _getDefaultWeather();
  }

  /// wttr.in 응답 파싱
  WeatherData _parseWttrResponse(Map<String, dynamic> data) {
    try {
      final current = data['current_condition']?[0];
      if (current == null) return _getDefaultWeather();
      
      final temp = double.tryParse(current['temp_C'] ?? '15') ?? 15;
      final humidity = int.tryParse(current['humidity'] ?? '50') ?? 50;
      final windSpeed = double.tryParse(current['windspeedKmph'] ?? '10') ?? 10;
      final weatherDesc = current['weatherDesc']?[0]?['value'] ?? 'Clear';
      
      String condition = 'Sunny';
      String description = '맑음';
      
      final desc = weatherDesc.toLowerCase();
      if (desc.contains('rain') || desc.contains('drizzle')) {
        condition = 'Rainy';
        description = '비';
      } else if (desc.contains('cloud') || desc.contains('overcast')) {
        condition = 'Cloudy';
        description = '흐림';
      } else if (desc.contains('partly')) {
        condition = 'PartlyCloudy';
        description = '구름조금';
      } else if (desc.contains('snow')) {
        condition = 'Snowy';
        description = '눈';
      } else if (desc.contains('clear') || desc.contains('sunny')) {
        condition = 'Sunny';
        description = '맑음';
      }
      
      return WeatherData(
        temperature: temp,
        condition: condition,
        description: description,
        humidity: humidity,
        windSpeed: windSpeed / 3.6, // km/h -> m/s
        dustStatus: '보통', // 미세먼지는 별도 API 필요
      );
    } catch (e) {
      return _getDefaultWeather();
    }
  }

  /// 기상청 API 응답 파싱
  WeatherData? _parseWeatherResponse(Map<String, dynamic> data) {
    try {
      final items = data['response']?['body']?['items']?['item'] as List?;
      if (items == null || items.isEmpty) return null;
      
      double temp = 15;
      int humidity = 50;
      double windSpeed = 3;
      String condition = 'Sunny';
      
      for (final item in items) {
        final category = item['category'];
        final value = item['obsrValue']?.toString() ?? '';
        
        switch (category) {
          case 'T1H': // 기온
            temp = double.tryParse(value) ?? temp;
            break;
          case 'REH': // 습도
            humidity = int.tryParse(value) ?? humidity;
            break;
          case 'WSD': // 풍속
            windSpeed = double.tryParse(value) ?? windSpeed;
            break;
          case 'PTY': // 강수형태 (0:없음, 1:비, 2:비/눈, 3:눈, 4:소나기)
            final pty = int.tryParse(value) ?? 0;
            if (pty == 1 || pty == 4) condition = 'Rainy';
            else if (pty == 2) condition = 'Rainy';
            else if (pty == 3) condition = 'Snowy';
            break;
        }
      }
      
      return WeatherData(
        temperature: temp,
        condition: condition,
        description: _getKoreanDescription(condition),
        humidity: humidity,
        windSpeed: windSpeed,
        dustStatus: '보통',
      );
    } catch (e) {
      return null;
    }
  }

  /// 주간 예보 가져오기
  Future<List<DailyForecast>> getWeeklyForecast({String? serviceKey}) async {
    try {
      // wttr.in에서 주간 예보도 가져오기
      final url = Uri.parse('https://wttr.in/Gunsan,Korea?format=j1');
      
      final response = await http.get(url, headers: {
        'User-Agent': 'Mozilla/5.0',
      }).timeout(const Duration(seconds: 10));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return _parseWttrForecast(data);
      }
    } catch (e) {
      // 무시
    }
    
    return _getDefaultForecast();
  }

  /// wttr.in 예보 파싱
  List<DailyForecast> _parseWttrForecast(Map<String, dynamic> data) {
    try {
      final weather = data['weather'] as List?;
      if (weather == null) return _getDefaultForecast();
      
      final dayNames = ['오늘', '내일', '모레'];
      final forecasts = <DailyForecast>[];
      
      for (int i = 0; i < weather.length && i < 3; i++) {
        final day = weather[i];
        final date = DateTime.now().add(Duration(days: i));
        
        final maxTemp = int.tryParse(day['maxtempC'] ?? '20') ?? 20;
        final minTemp = int.tryParse(day['mintempC'] ?? '10') ?? 10;
        
        // 시간별 날씨에서 대표 날씨 추출
        final hourly = day['hourly'] as List?;
        String condition = 'Sunny';
        int rainChance = 0;
        
        if (hourly != null && hourly.isNotEmpty) {
          final noon = hourly.length > 4 ? hourly[4] : hourly[0];
          rainChance = int.tryParse(noon['chanceofrain'] ?? '0') ?? 0;
          
          final desc = (noon['weatherDesc']?[0]?['value'] ?? '').toString().toLowerCase();
          if (desc.contains('rain')) condition = 'Rainy';
          else if (desc.contains('cloud') || desc.contains('overcast')) condition = 'Cloudy';
          else if (desc.contains('partly')) condition = 'PartlyCloudy';
          else if (desc.contains('snow')) condition = 'Snowy';
        }
        
        forecasts.add(DailyForecast(
          day: dayNames[i],
          date: '${date.month}/${date.day}',
          high: maxTemp,
          low: minTemp,
          condition: condition,
          rainProbability: rainChance,
        ));
      }
      
      return forecasts;
    } catch (e) {
      return _getDefaultForecast();
    }
  }

  /// 물때 정보 가져오기
  Future<List<TideInfo>> getTideInfo({String? serviceKey}) async {
    try {
      // 국립해양조사원 API는 서비스키 필요
      // 없으면 샘플 데이터 반환 (실제 물때 계산은 복잡함)
      
      if (serviceKey != null && serviceKey.isNotEmpty) {
        final now = DateTime.now();
        final dateStr = '${now.year}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}';
        
        final url = Uri.parse(
          '$_tideBaseUrl'
          '?ServiceKey=$serviceKey'
          '&ObsCode=$_gunsanPortCode'
          '&Date=$dateStr'
          '&ResultType=json'
        );
        
        final response = await http.get(url).timeout(const Duration(seconds: 10));
        
        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          return _parseTideResponse(data);
        }
      }
    } catch (e) {
      // 무시
    }
    
    // 기본 물때 데이터 (실제 조석 예보 기반 샘플)
    return _getDefaultTides();
  }

  /// 물때 응답 파싱
  List<TideInfo> _parseTideResponse(Map<String, dynamic> data) {
    // 실제 파싱 로직 구현 필요
    return _getDefaultTides();
  }

  // === Helper Methods ===

  String _getBaseDate(DateTime dt) {
    return '${dt.year}${dt.month.toString().padLeft(2, '0')}${dt.day.toString().padLeft(2, '0')}';
  }

  String _getBaseTime(DateTime dt) {
    // 초단기실황은 매시 정각 발표, 40분 이후 제공
    int hour = dt.hour;
    if (dt.minute < 40) hour -= 1;
    if (hour < 0) hour = 23;
    return '${hour.toString().padLeft(2, '0')}00';
  }

  String _getKoreanDescription(String condition) {
    switch (condition) {
      case 'Sunny': return '맑음';
      case 'PartlyCloudy': return '구름조금';
      case 'Cloudy': return '흐림';
      case 'Rainy': return '비';
      case 'Snowy': return '눈';
      default: return '맑음';
    }
  }

  WeatherData _getDefaultWeather() {
    return WeatherData(
      temperature: 15,
      condition: 'Sunny',
      description: '맑음',
      humidity: 50,
      windSpeed: 3.0,
      dustStatus: '보통',
    );
  }

  List<DailyForecast> _getDefaultForecast() {
    final now = DateTime.now();
    return [
      DailyForecast(day: '오늘', date: '${now.month}/${now.day}', high: 16, low: 8, condition: 'Sunny', rainProbability: 0),
      DailyForecast(day: '내일', date: '${now.month}/${now.day + 1}', high: 18, low: 10, condition: 'PartlyCloudy', rainProbability: 20),
      DailyForecast(day: '모레', date: '${now.month}/${now.day + 2}', high: 14, low: 6, condition: 'Cloudy', rainProbability: 40),
    ];
  }

  List<TideInfo> _getDefaultTides() {
    return List.generate(3, (i) => TideInfo.sample(i));
  }
}
