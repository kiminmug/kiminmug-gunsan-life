import 'package:flutter/material.dart';

class WeatherCard extends StatelessWidget {
  final Map<String, dynamic> data;
  final bool isLoading;

  const WeatherCard({
    super.key,
    required this.data,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return _buildLoadingCard();
    }

    final temp = data['temp'] ?? '15';
    final status = data['status'] ?? '맑음';
    final humidity = data['humidity'] ?? '45';
    final wind = data['wind'] ?? '3.2';
    final dust = data['dust'] ?? '보통';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF3549B3), Color(0xFF64A7FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF3549B3).withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 상단: 지역명 + 미세먼지
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.location_on,
                    color: Colors.white,
                    size: 20,
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    '군산시',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: _getDustColor(dust),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '미세먼지 $dust',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // 중앙: 온도 + 날씨 아이콘
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 온도
              Text(
                '$temp°',
                style: const TextStyle(
                  fontSize: 72,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  height: 1.0,
                ),
              ),
              const Spacer(),
              // 날씨 아이콘
              Icon(
                _getWeatherIcon(status),
                size: 72,
                color: Colors.white.withValues(alpha: 0.9),
              ),
            ],
          ),
          
          // 날씨 상태 + 상세 정보
          Row(
            children: [
              Text(
                status,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 16),
              Text(
                '습도 $humidity% · 풍속 ${wind}m/s',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withValues(alpha: 0.8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingCard() {
    return Container(
      width: double.infinity,
      height: 180,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF3549B3), Color(0xFF64A7FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: const Center(
        child: CircularProgressIndicator(
          color: Colors.white,
        ),
      ),
    );
  }

  IconData _getWeatherIcon(String status) {
    if (status.contains('맑')) return Icons.wb_sunny_rounded;
    if (status.contains('구름') || status.contains('흐림')) return Icons.cloud_rounded;
    if (status.contains('비')) return Icons.water_drop_rounded;
    if (status.contains('눈')) return Icons.ac_unit_rounded;
    if (status.contains('안개')) return Icons.foggy;
    return Icons.wb_sunny_rounded;
  }

  Color _getDustColor(String dust) {
    switch (dust) {
      case '좋음':
        return const Color(0xFF10B981);
      case '보통':
        return const Color(0xFF3B82F6);
      case '나쁨':
        return const Color(0xFFF59E0B);
      case '매우나쁨':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF3B82F6);
    }
  }
}
