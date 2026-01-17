import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'config/theme.dart';
import 'providers/app_provider.dart';
import 'screens/home/home_screen.dart';
import 'screens/news/news_screen.dart';
import 'screens/weather/weather_screen.dart';
import 'screens/life/life_screen.dart';
import 'screens/ai_chat/ai_chat_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    if (kDebugMode) {
      print('✅ Firebase initialized successfully');
    }
  } catch (e) {
    if (kDebugMode) {
      print('⚠️ Firebase initialization failed: $e');
    }
  }
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Load saved API keys
  final prefs = await SharedPreferences.getInstance();
  final geminiKey = prefs.getString('gemini_api_key');
  final weatherKey = prefs.getString('weather_api_key');
  
  runApp(GunsanLifeApp(geminiKey: geminiKey, weatherKey: weatherKey));
}

class GunsanLifeApp extends StatelessWidget {
  final String? geminiKey;
  final String? weatherKey;
  
  const GunsanLifeApp({super.key, this.geminiKey, this.weatherKey});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) {
        final provider = AppProvider();
        // Auto-apply saved API keys
        if (geminiKey != null || weatherKey != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            provider.setApiKeys(geminiKey: geminiKey, weatherKey: weatherKey);
          });
        }
        return provider;
      },
      child: MaterialApp(
        title: '군산 Life',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const MainNavigation(),
      ),
    );
  }
}

class MainNavigation extends StatelessWidget {
  const MainNavigation({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppProvider>(
      builder: (context, provider, _) {
        return Scaffold(
          body: IndexedStack(
            index: provider.currentTabIndex,
            children: const [
              HomeScreen(),
              NewsScreen(),
              WeatherScreen(),
              LifeScreen(),
              AiChatScreen(),
            ],
          ),
          bottomNavigationBar: Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildNavItem(
                      context,
                      index: 0,
                      icon: Icons.home_outlined,
                      activeIcon: Icons.home_rounded,
                      label: '홈',
                      isSelected: provider.currentTabIndex == 0,
                    ),
                    _buildNavItem(
                      context,
                      index: 1,
                      icon: Icons.newspaper_outlined,
                      activeIcon: Icons.newspaper_rounded,
                      label: '뉴스',
                      isSelected: provider.currentTabIndex == 1,
                    ),
                    _buildNavItem(
                      context,
                      index: 2,
                      icon: Icons.wb_sunny_outlined,
                      activeIcon: Icons.wb_sunny_rounded,
                      label: '날씨',
                      isSelected: provider.currentTabIndex == 2,
                    ),
                    _buildNavItem(
                      context,
                      index: 3,
                      icon: Icons.local_hospital_outlined,
                      activeIcon: Icons.local_hospital_rounded,
                      label: '생활',
                      isSelected: provider.currentTabIndex == 3,
                    ),
                    _buildNavItem(
                      context,
                      index: 4,
                      icon: Icons.smart_toy_outlined,
                      activeIcon: Icons.smart_toy_rounded,
                      label: 'AI',
                      isSelected: provider.currentTabIndex == 4,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required bool isSelected,
  }) {
    return GestureDetector(
      onTap: () => context.read<AppProvider>().setTabIndex(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected 
              ? AppColors.primary.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: isSelected ? AppColors.primary : AppColors.textTertiary,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppColors.primary : AppColors.textTertiary,
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
