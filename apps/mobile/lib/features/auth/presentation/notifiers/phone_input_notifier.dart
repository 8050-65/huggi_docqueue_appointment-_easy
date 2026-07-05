// lib/features/auth/presentation/notifiers/phone_input_notifier.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PhoneInputState {
  final String phone;
  final String? error;
  final bool isValid;

  const PhoneInputState({
    required this.phone,
    this.error,
    this.isValid = false,
  });

  PhoneInputState copyWith({
    String? phone,
    String? error,
    bool? isValid,
  }) {
    return PhoneInputState(
      phone: phone ?? this.phone,
      error: error,
      isValid: isValid ?? this.isValid,
    );
  }
}

class PhoneInputNotifier extends StateNotifier<PhoneInputState> {
  PhoneInputNotifier() : super(const PhoneInputState(phone: ''));

  /// Update phone and validate
  void updatePhone(String phone) {
    var cleaned = phone.replaceAll(RegExp('[^0-9]'), '');

    if (cleaned.startsWith('91') && cleaned.length >= 12) {
      cleaned = cleaned.substring(2);
    }

    if (cleaned.isEmpty) {
      state = PhoneInputState(
        phone: cleaned,
        error: 'Phone number required',
        isValid: false,
      );
      return;
    }

    if (cleaned.length < 10) {
      state = PhoneInputState(
        phone: cleaned,
        error: 'Phone number must be 10 digits',
        isValid: false,
      );
      return;
    }

    if (cleaned.length > 10) {
      state = PhoneInputState(
        phone: cleaned.substring(0, 10),
        error: null,
        isValid: true,
      );
      return;
    }

    state = PhoneInputState(
      phone: cleaned,
      error: null,
      isValid: true,
    );
  }

  /// Clear
  void clear() {
    state = const PhoneInputState(phone: '');
  }

  /// Get formatted phone number (10 digits only)
  String getFormattedPhone() => state.phone.length == 10 ? state.phone : '';
}
