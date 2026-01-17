import 'package:flutter_test/flutter_test.dart';
import 'package:gunsan_life/main.dart';

void main() {
  testWidgets('App should build without errors', (WidgetTester tester) async {
    await tester.pumpWidget(const GunsanLifeApp());
    expect(find.text('군산 Life'), findsOneWidget);
  });
}
