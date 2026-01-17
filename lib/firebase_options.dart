import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Firebase 설정 옵션
/// gunsan-life 프로젝트 설정
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        throw UnsupportedError(
          'iOS 플랫폼은 현재 지원되지 않습니다.',
        );
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'macOS 플랫폼은 현재 지원되지 않습니다.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'Windows 플랫폼은 현재 지원되지 않습니다.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'Linux 플랫폼은 현재 지원되지 않습니다.',
        );
      default:
        throw UnsupportedError(
          '알 수 없는 플랫폼입니다.',
        );
    }
  }

  /// Web 플랫폼 설정
  /// Firebase Console > 프로젝트 설정 > 웹 앱에서 확인 가능
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAEjIF7u47lYLxTsrEJiIlB9dLqI9elB44',
    appId: '1:25807562095:web:gunsan_life_web',
    messagingSenderId: '25807562095',
    projectId: 'gunsan-life',
    authDomain: 'gunsan-life.firebaseapp.com',
    storageBucket: 'gunsan-life.firebasestorage.app',
  );

  /// Android 플랫폼 설정
  /// google-services.json에서 추출
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAEjIF7u47lYLxTsrEJiIlB9dLqI9elB44',
    appId: '1:25807562095:android:e8dee7b20c486f31b6b49a',
    messagingSenderId: '25807562095',
    projectId: 'gunsan-life',
    storageBucket: 'gunsan-life.firebasestorage.app',
  );
}
