import 'package:flutter/material.dart';
import '../../config/theme.dart';

/// 재사용 가능한 정보 카드 위젯
class InfoCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final bool hasBorder;
  
  const InfoCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.backgroundColor,
    this.hasBorder = true,
  });
  
  @override
  Widget build(BuildContext context) {
    return Material(
      color: backgroundColor ?? AppColors.surface,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Container(
          padding: padding ?? const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: hasBorder 
                ? Border.all(color: AppColors.border, width: 1)
                : null,
          ),
          child: child,
        ),
      ),
    );
  }
}

/// 그라데이션 배경 카드
class GradientCard extends StatelessWidget {
  final Widget child;
  final Gradient gradient;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  
  const GradientCard({
    super.key,
    required this.child,
    required this.gradient,
    this.padding,
    this.onTap,
  });
  
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        child: Ink(
          decoration: BoxDecoration(
            gradient: gradient,
            borderRadius: BorderRadius.circular(AppRadius.xl),
            boxShadow: AppShadows.lg,
          ),
          child: Padding(
            padding: padding ?? const EdgeInsets.all(AppSpacing.lg),
            child: child,
          ),
        ),
      ),
    );
  }
}

/// 퀵 액션 버튼 카드
class QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? subtitle;
  final Color iconBackgroundColor;
  final Color iconColor;
  final VoidCallback? onTap;
  
  const QuickActionCard({
    super.key,
    required this.icon,
    required this.label,
    this.subtitle,
    required this.iconBackgroundColor,
    required this.iconColor,
    this.onTap,
  });
  
  @override
  Widget build(BuildContext context) {
    return InfoCard(
      onTap: onTap,
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconBackgroundColor,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            label,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          if (subtitle != null)
            Text(
              subtitle!,
              style: Theme.of(context).textTheme.bodySmall,
            ),
        ],
      ),
    );
  }
}
