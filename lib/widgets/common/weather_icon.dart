import 'package:flutter/material.dart';
import '../../config/theme.dart';

/// 날씨 상태에 따른 아이콘 위젯
class WeatherIcon extends StatelessWidget {
  final String condition;
  final double size;
  final Color? color;
  
  const WeatherIcon({
    super.key,
    required this.condition,
    this.size = 24,
    this.color,
  });
  
  @override
  Widget build(BuildContext context) {
    return Icon(
      _getIconData(),
      size: size,
      color: color ?? _getDefaultColor(),
    );
  }
  
  IconData _getIconData() {
    final cond = condition.toLowerCase();
    
    if (cond.contains('sunny') || cond.contains('clear') || cond.contains('맑음')) {
      return Icons.wb_sunny_rounded;
    }
    if (cond.contains('partly') || cond.contains('구름조금')) {
      return Icons.wb_cloudy;
    }
    if (cond.contains('cloud') || cond.contains('흐림')) {
      return Icons.cloud_rounded;
    }
    if (cond.contains('rain') || cond.contains('비')) {
      return Icons.water_drop_rounded;
    }
    if (cond.contains('snow') || cond.contains('눈')) {
      return Icons.ac_unit_rounded;
    }
    
    return Icons.wb_sunny_rounded;
  }
  
  Color _getDefaultColor() {
    final cond = condition.toLowerCase();
    
    if (cond.contains('sunny') || cond.contains('clear') || cond.contains('맑음')) {
      return AppColors.secondary;
    }
    if (cond.contains('partly') || cond.contains('구름조금')) {
      return Colors.amber;
    }
    if (cond.contains('cloud') || cond.contains('흐림')) {
      return AppColors.textTertiary;
    }
    if (cond.contains('rain') || cond.contains('비')) {
      return AppColors.primary;
    }
    if (cond.contains('snow') || cond.contains('눈')) {
      return Colors.lightBlue.shade200;
    }
    
    return AppColors.secondary;
  }
}
