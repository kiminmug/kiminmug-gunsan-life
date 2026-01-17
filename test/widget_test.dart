import 'package:flutter_test/flutter_test.dart';
import 'package:gunsan_life_web/main.dart';

void main() {
  testWidgets('App loads', (WidgetTester tester) async {
    await tester.pumpWidget(const GunsanLifeWebApp());
  });
}
