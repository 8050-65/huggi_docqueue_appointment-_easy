// test/features/auth/presentation/notifiers/phone_input_notifier_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:huggi_patient_app/features/auth/presentation/notifiers/phone_input_notifier.dart';

void main() {
  group('PhoneInputNotifier', () {
    late PhoneInputNotifier notifier;

    setUp(() {
      notifier = PhoneInputNotifier();
    });

    test('initial state is empty and invalid', () {
      expect(notifier.state.phone, isEmpty);
      expect(notifier.state.isValid, isFalse);
    });

    test('updatePhone accepts 10 digit number', () {
      notifier.updatePhone('9876543210');

      expect(notifier.state.phone, '9876543210');
      expect(notifier.state.isValid, isTrue);
      expect(notifier.state.error, isNull);
    });

    test('updatePhone removes non-numeric characters', () {
      notifier.updatePhone('+91 (987) 654-3210');

      expect(notifier.state.phone, '9876543210');
      expect(notifier.state.isValid, isTrue);
    });

    test('updatePhone shows error for short numbers', () {
      notifier.updatePhone('12345');

      expect(notifier.state.phone, '12345');
      expect(notifier.state.isValid, isFalse);
      expect(notifier.state.error, isNotNull);
    });

    test('updatePhone truncates to 10 digits', () {
      notifier.updatePhone('98765432101');

      expect(notifier.state.phone, '9876543210');
      expect(notifier.state.isValid, isTrue);
    });

    test('getFormattedPhone returns 10 digits or empty', () {
      notifier.updatePhone('9876543210');
      expect(notifier.getFormattedPhone(), '9876543210');

      notifier.updatePhone('123');
      expect(notifier.getFormattedPhone(), isEmpty);
    });

    test('clear resets state', () {
      notifier.updatePhone('9876543210');
      notifier.clear();

      expect(notifier.state.phone, isEmpty);
      expect(notifier.state.isValid, isFalse);
    });
  });
}
