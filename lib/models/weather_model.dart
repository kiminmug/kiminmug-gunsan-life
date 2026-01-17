/// 날씨 데이터 모델

class WeatherData {
  final double temperature;
  final String condition;
  final String description;
  final int humidity;
  final double windSpeed;
  final String dustStatus;
  final DateTime updatedAt;
  
  WeatherData({
    required this.temperature,
    required this.condition,
    required this.description,
    required this.humidity,
    required this.windSpeed,
    required this.dustStatus,
    DateTime? updatedAt,
  }) : updatedAt = updatedAt ?? DateTime.now();
  
  factory WeatherData.fromJson(Map<String, dynamic> json) {
    return WeatherData(
      temperature: (json['temp'] ?? 0).toDouble(),
      condition: json['condition'] ?? 'Sunny',
      description: json['description'] ?? '맑음',
      humidity: json['humidity'] ?? 0,
      windSpeed: (json['windSpeed'] ?? 0).toDouble(),
      dustStatus: json['dustStatus'] ?? '보통',
    );
  }
  
  // 샘플 데이터 생성
  factory WeatherData.sample() {
    return WeatherData(
      temperature: 15,
      condition: 'Sunny',
      description: '맑음',
      humidity: 45,
      windSpeed: 3.2,
      dustStatus: '좋음',
    );
  }
}

class DailyForecast {
  final String day;
  final String date;
  final int high;
  final int low;
  final String condition;
  final int rainProbability;
  
  DailyForecast({
    required this.day,
    required this.date,
    required this.high,
    required this.low,
    required this.condition,
    required this.rainProbability,
  });
  
  factory DailyForecast.fromJson(Map<String, dynamic> json) {
    return DailyForecast(
      day: json['day'] ?? '',
      date: json['date'] ?? '',
      high: json['high'] ?? 0,
      low: json['low'] ?? 0,
      condition: json['condition'] ?? 'Sunny',
      rainProbability: json['rainProbability'] ?? 0,
    );
  }
}

class TideInfo {
  final String date;
  final String day;
  final List<TideTime> tides;
  
  TideInfo({
    required this.date,
    required this.day,
    required this.tides,
  });
  
  factory TideInfo.sample(int dayOffset) {
    final now = DateTime.now().add(Duration(days: dayOffset));
    final dayNames = ['오늘', '내일', '모레'];
    
    return TideInfo(
      date: '${now.month}.${now.day}',
      day: dayOffset < 3 ? dayNames[dayOffset] : '${now.month}/${now.day}',
      tides: [
        TideTime(time: '04:12', type: 'high', height: 680),
        TideTime(time: '10:45', type: 'low', height: 120),
        TideTime(time: '16:30', type: 'high', height: 650),
        TideTime(time: '22:50', type: 'low', height: 90),
      ],
    );
  }
}

class TideTime {
  final String time;
  final String type; // 'high' or 'low'
  final int height; // cm
  
  TideTime({
    required this.time,
    required this.type,
    required this.height,
  });
  
  bool get isHigh => type == 'high';
}
