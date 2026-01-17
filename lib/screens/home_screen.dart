import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../widgets/weather_card.dart';
import '../widgets/menu_button.dart';
import '../widgets/news_section.dart';
import '../widgets/market_ticker.dart';
import '../services/data_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final DataService _dataService = DataService();
  
  Map<String, dynamic> _weatherData = {};
  List<Map<String, dynamic>> _newsData = [];
  Map<String, dynamic> _marketData = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    try {
      final weather = await _dataService.getWeather();
      final news = await _dataService.getNews();
      final market = await _dataService.getMarketData();
      
      setState(() {
        _weatherData = weather;
        _newsData = news;
        _marketData = market;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              children: [
                // 헤더
                _buildHeader(),
                
                // 날씨 카드
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: WeatherCard(
                    data: _weatherData,
                    isLoading: _isLoading,
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // 메뉴 버튼 그리드
                _buildMenuGrid(),
                
                const SizedBox(height: 24),
                
                // 뉴스 섹션
                NewsSection(
                  news: _newsData,
                  isLoading: _isLoading,
                ),
                
                const SizedBox(height: 16),
                
                // 환율/주식 티커
                MarketTicker(
                  data: _marketData,
                  isLoading: _isLoading,
                ),
                
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        children: [
          // 로고
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF3549B3), Color(0xFF64A7FF)],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.location_on,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '군산 Life',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A1A2E),
                ),
              ),
              Text(
                '군산 시민의 생활 도우미',
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF6B7280),
                ),
              ),
            ],
          ),
          const Spacer(),
          // 새로고침 버튼
          IconButton(
            onPressed: _loadData,
            icon: Icon(
              Icons.refresh_rounded,
              color: _isLoading ? Colors.grey : const Color(0xFF3549B3),
              size: 28,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuGrid() {
    final menuItems = [
      {
        'icon': Icons.newspaper_rounded,
        'label': '뉴스',
        'color': const Color(0xFFFF6B35),
        'onTap': () => _openUrl('https://news.google.com/search?q=군산&hl=ko'),
      },
      {
        'icon': Icons.waves_rounded,
        'label': '날씨&물때',
        'color': const Color(0xFF3B82F6),
        'onTap': () => _showWeatherTideDetail(),
      },
      {
        'icon': Icons.phone_in_talk_rounded,
        'label': '긴급전화',
        'color': const Color(0xFFEF4444),
        'onTap': () => _showEmergencyNumbers(),
      },
      {
        'icon': Icons.celebration_rounded,
        'label': '행사',
        'color': const Color(0xFF8B5CF6),
        'onTap': () => _openUrl('https://www.gunsan.go.kr/main/m_event'),
      },
      {
        'icon': Icons.directions_bus_rounded,
        'label': '버스',
        'color': const Color(0xFF10B981),
        'onTap': () => _openUrl('https://www.gunsan.go.kr/main/m_bus'),
      },
      {
        'icon': Icons.smart_toy_rounded,
        'label': 'AI 도우미',
        'color': const Color(0xFF06B6D4),
        'onTap': () => _openUrl('https://gemini.google.com'),
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.0,
        ),
        itemCount: menuItems.length,
        itemBuilder: (context, index) {
          final item = menuItems[index];
          return MenuButton(
            icon: item['icon'] as IconData,
            label: item['label'] as String,
            color: item['color'] as Color,
            onTap: item['onTap'] as VoidCallback,
          );
        },
      ),
    );
  }

  void _showWeatherTideDetail() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _WeatherTideSheet(
        weatherData: _weatherData,
        dataService: _dataService,
      ),
    );
  }

  void _showEmergencyNumbers() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _EmergencySheet(),
    );
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}

// 날씨&물때 상세 시트
class _WeatherTideSheet extends StatefulWidget {
  final Map<String, dynamic> weatherData;
  final DataService dataService;

  const _WeatherTideSheet({
    required this.weatherData,
    required this.dataService,
  });

  @override
  State<_WeatherTideSheet> createState() => _WeatherTideSheetState();
}

class _WeatherTideSheetState extends State<_WeatherTideSheet> {
  List<Map<String, dynamic>> _tideData = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTideData();
  }

  Future<void> _loadTideData() async {
    final tides = await widget.dataService.getTideInfo();
    setState(() {
      _tideData = tides;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // 핸들
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          
          // 타이틀
          const Padding(
            padding: EdgeInsets.all(20),
            child: Text(
              '날씨 & 물때 정보',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 날씨 상세
                  _buildWeatherDetail(),
                  
                  const SizedBox(height: 24),
                  
                  // 물때 정보
                  const Text(
                    '🌊 군산항 물때',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator())
                  else
                    ..._tideData.map((tide) => _buildTideItem(tide)),
                  
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeatherDetail() {
    final temp = widget.weatherData['temp'] ?? '15';
    final status = widget.weatherData['status'] ?? '맑음';
    final humidity = widget.weatherData['humidity'] ?? '45';
    final wind = widget.weatherData['wind'] ?? '3.2';
    final dust = widget.weatherData['dust'] ?? '보통';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF3549B3), Color(0xFF64A7FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '군산시',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.white70,
                    ),
                  ),
                  Text(
                    '$temp°',
                    style: const TextStyle(
                      fontSize: 64,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    status,
                    style: const TextStyle(
                      fontSize: 24,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Icon(
                _getWeatherIcon(status),
                size: 80,
                color: Colors.white,
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildWeatherInfo('습도', '$humidity%'),
              _buildWeatherInfo('풍속', '${wind}m/s'),
              _buildWeatherInfo('미세먼지', dust),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWeatherInfo(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: Colors.white70,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildTideItem(Map<String, dynamic> tide) {
    final isHigh = tide['type'] == '만조';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isHigh ? const Color(0xFFE0F2FE) : const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(
            isHigh ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
            color: isHigh ? const Color(0xFF0369A1) : const Color(0xFFB45309),
            size: 28,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tide['type'] ?? '',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isHigh ? const Color(0xFF0369A1) : const Color(0xFFB45309),
                  ),
                ),
                Text(
                  tide['time'] ?? '',
                  style: const TextStyle(
                    fontSize: 16,
                    color: Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
          Text(
            tide['height'] ?? '',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isHigh ? const Color(0xFF0369A1) : const Color(0xFFB45309),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getWeatherIcon(String status) {
    if (status.contains('맑')) return Icons.wb_sunny_rounded;
    if (status.contains('구름')) return Icons.cloud_rounded;
    if (status.contains('비')) return Icons.water_drop_rounded;
    if (status.contains('눈')) return Icons.ac_unit_rounded;
    return Icons.wb_sunny_rounded;
  }
}

// 긴급전화 시트
class _EmergencySheet extends StatelessWidget {
  const _EmergencySheet();

  @override
  Widget build(BuildContext context) {
    final emergencyNumbers = [
      {'name': '경찰서', 'number': '112', 'icon': Icons.local_police, 'color': const Color(0xFF3B82F6)},
      {'name': '소방서/응급', 'number': '119', 'icon': Icons.local_fire_department, 'color': const Color(0xFFEF4444)},
      {'name': '군산시청', 'number': '063-454-4000', 'icon': Icons.account_balance, 'color': const Color(0xFF10B981)},
      {'name': '군산의료원', 'number': '063-472-5000', 'icon': Icons.local_hospital, 'color': const Color(0xFFF59E0B)},
      {'name': '수도고장', 'number': '063-454-3651', 'icon': Icons.water, 'color': const Color(0xFF06B6D4)},
      {'name': '전기고장', 'number': '123', 'icon': Icons.electric_bolt, 'color': const Color(0xFF8B5CF6)},
    ];

    return Container(
      height: MediaQuery.of(context).size.height * 0.6,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const Padding(
            padding: EdgeInsets.all(20),
            child: Text(
              '📞 긴급 전화번호',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: emergencyNumbers.length,
              itemBuilder: (context, index) {
                final item = emergencyNumbers[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 8,
                    ),
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: (item['color'] as Color).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        item['icon'] as IconData,
                        color: item['color'] as Color,
                        size: 28,
                      ),
                    ),
                    title: Text(
                      item['name'] as String,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      item['number'] as String,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                    trailing: IconButton(
                      onPressed: () => _makeCall(item['number'] as String),
                      icon: const Icon(
                        Icons.call_rounded,
                        color: Color(0xFF10B981),
                        size: 28,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _makeCall(String number) async {
    final uri = Uri.parse('tel:$number');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}
