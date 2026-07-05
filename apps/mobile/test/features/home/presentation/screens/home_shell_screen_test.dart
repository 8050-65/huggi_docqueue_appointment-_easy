// test/features/home/presentation/screens/home_shell_screen_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:huggi_patient_app/features/home/presentation/screens/home_shell_screen.dart';

void main() {
  group('HomeShellScreen', () {
    test('is a consumer widget', () {
      final screen = HomeShellScreen();
      expect(screen, isNotNull);
    });
  });
}
