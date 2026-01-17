# Firebase 연동 가이드 (군산 Life)

이 문서는 군산 Life 앱에 Firebase 기능을 추가하는 방법을 설명합니다.

## 📋 사전 준비

1. **Firebase 콘솔 접속**: https://console.firebase.google.com/
2. **새 프로젝트 생성** 또는 기존 프로젝트 선택
3. **Android 앱 등록**:
   - 패키지 이름: `com.gunsan.gunsan_life`
   - 앱 별명: 군산 Life

## 📁 필요한 파일

### 1. google-services.json (Android)
Firebase 콘솔에서 다운로드하여 다음 경로에 배치:
```
android/app/google-services.json
```

### 2. Firebase Admin SDK (선택, 서버용)
백엔드 데이터베이스 작업이 필요한 경우:
- Firebase 콘솔 → 프로젝트 설정 → 서비스 계정
- Python 선택 → "새 비공개 키 생성"
- 다운로드한 JSON 파일을 서버에 배치

## 🔧 Flutter 설정

### pubspec.yaml에 Firebase 패키지 추가
```yaml
dependencies:
  # Firebase 패키지 (고정 버전)
  firebase_core: 3.6.0
  cloud_firestore: 5.4.3
  firebase_messaging: 15.1.3
  firebase_analytics: 11.3.3
```

### main.dart 수정
```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  // ... rest of initialization
}
```

### firebase_options.dart 생성
```dart
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      default:
        throw UnsupportedError('Unsupported platform');
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'YOUR_WEB_API_KEY',
    appId: 'YOUR_WEB_APP_ID',
    messagingSenderId: 'YOUR_SENDER_ID',
    projectId: 'YOUR_PROJECT_ID',
    authDomain: 'YOUR_AUTH_DOMAIN',
    storageBucket: 'YOUR_STORAGE_BUCKET',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'YOUR_ANDROID_API_KEY',
    appId: 'YOUR_ANDROID_APP_ID',
    messagingSenderId: 'YOUR_SENDER_ID',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
  );
}
```

## 📱 푸시 알림 설정 (Firebase Messaging)

### AndroidManifest.xml 추가
```xml
<manifest>
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <application>
        <!-- Firebase Messaging -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="gunsan_life_channel" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@mipmap/ic_launcher" />
    </application>
</manifest>
```

### 푸시 알림 서비스 코드
```dart
import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // 권한 요청
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // FCM 토큰 획득
      final token = await _messaging.getToken();
      print('FCM Token: $token');

      // 포그라운드 메시지 처리
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    print('Received foreground message: ${message.notification?.title}');
    // 알림 표시 로직
  }
}
```

## 📊 Analytics 설정

```dart
import 'package:firebase_analytics/firebase_analytics.dart';

class AnalyticsService {
  final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;

  Future<void> logScreenView(String screenName) async {
    await _analytics.logScreenView(screenName: screenName);
  }

  Future<void> logEvent(String name, Map<String, dynamic>? params) async {
    await _analytics.logEvent(name: name, parameters: params);
  }
}
```

## 🗄️ Firestore 데이터베이스 (선택)

### 샘플 데이터 구조
```
/users/{userId}
  - name: string
  - email: string
  - createdAt: timestamp

/news_bookmarks/{userId}/items/{itemId}
  - newsId: string
  - title: string
  - savedAt: timestamp

/notifications/{notificationId}
  - title: string
  - message: string
  - type: string
  - sentAt: timestamp
```

## 🔒 보안 규칙 (개발용)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 개발 중 모든 읽기/쓰기 허용 (프로덕션에서는 수정 필요)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## ✅ 체크리스트

- [ ] Firebase 프로젝트 생성
- [ ] Android 앱 등록 (패키지: com.gunsan.gunsan_life)
- [ ] google-services.json 다운로드 및 배치
- [ ] pubspec.yaml에 Firebase 패키지 추가
- [ ] firebase_options.dart 생성
- [ ] main.dart에서 Firebase 초기화
- [ ] 푸시 알림 권한 및 서비스 구현
- [ ] Analytics 이벤트 로깅 구현
- [ ] (선택) Firestore 데이터베이스 설정

## 📞 지원

Firebase 연동 중 문제가 발생하면 이슈를 생성해 주세요.
