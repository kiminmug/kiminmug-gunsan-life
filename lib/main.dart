import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const GunsanLifeWebApp());
}

class GunsanLifeWebApp extends StatelessWidget {
  const GunsanLifeWebApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '군산 Life',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF3549B3),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Pretendard',
      ),
      home: const HomeScreen(),
    );
  }
}
