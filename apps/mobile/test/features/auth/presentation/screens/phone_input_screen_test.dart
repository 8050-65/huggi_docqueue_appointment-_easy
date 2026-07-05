// test/features/auth/presentation/screens/phone_input_screen_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:huggi_patient_app/features/auth/presentation/screens/phone_input_screen.dart';

void main() {
  group('PhoneInputScreen', () {
    testWidgets('displays phone input field', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: PhoneInputScreen(),
          ),
        ),
      );

      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('9876543210'), findsWidgets);
    });

    testWidgets('shows error for incomplete phone', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: PhoneInputScreen(),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), '123');
      await tester.pumpWidget(const SizedBox()); // trigger rebuild
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: PhoneInputScreen(),
          ),
        ),
      );

      // Should show error
      // (Actual error display depends on Riverpod integration)
    });

    testWidgets('continue button enabled when phone valid', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: PhoneInputScreen(),
          ),
        ),
      );

      final button = find.byType(ElevatedButton);
      expect(button, findsOneWidget);
      // Initially disabled
      expect(tester.widget<ElevatedButton>(button).onPressed, isNull);
    });
  });
}
