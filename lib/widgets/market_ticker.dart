import 'package:flutter/material.dart';

class MarketTicker extends StatelessWidget {
  final Map<String, dynamic> data;
  final bool isLoading;

  const MarketTicker({
    super.key,
    required this.data,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return _buildLoadingTicker();
    }

    final usdKrw = data['usd_krw'] ?? {'value': '1,450', 'change': '+2.50', 'isUp': true};
    final kospi = data['kospi'] ?? {'value': '2,485', 'change': '+12.30', 'isUp': true};
    final kosdaq = data['kosdaq'] ?? {'value': '718', 'change': '-3.20', 'isUp': false};

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 헤더
          Row(
            children: [
              const Icon(
                Icons.trending_up_rounded,
                color: Color(0xFF10B981),
                size: 20,
              ),
              const SizedBox(width: 8),
              const Text(
                '실시간 시세',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const Spacer(),
              Text(
                _getCurrentTime(),
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.white.withValues(alpha: 0.6),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // 시세 정보
          Row(
            children: [
              Expanded(
                child: _buildMarketItem(
                  '달러/원',
                  '₩${usdKrw['value']}',
                  usdKrw['change'] as String,
                  usdKrw['isUp'] as bool,
                ),
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.white.withValues(alpha: 0.1),
              ),
              Expanded(
                child: _buildMarketItem(
                  '코스피',
                  kospi['value'] as String,
                  kospi['change'] as String,
                  kospi['isUp'] as bool,
                ),
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.white.withValues(alpha: 0.1),
              ),
              Expanded(
                child: _buildMarketItem(
                  '코스닥',
                  kosdaq['value'] as String,
                  kosdaq['change'] as String,
                  kosdaq['isUp'] as bool,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMarketItem(String label, String value, String change, bool isUp) {
    final changeColor = isUp ? const Color(0xFFEF4444) : const Color(0xFF3B82F6);
    final changeIcon = isUp ? '▲' : '▼';

    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: Colors.white.withValues(alpha: 0.6),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          '$changeIcon $change',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: changeColor,
          ),
        ),
      ],
    );
  }

  Widget _buildLoadingTicker() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(16),
      height: 100,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(
        child: CircularProgressIndicator(
          color: Colors.white,
          strokeWidth: 2,
        ),
      ),
    );
  }

  String _getCurrentTime() {
    final now = DateTime.now();
    return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')} 기준';
  }
}
