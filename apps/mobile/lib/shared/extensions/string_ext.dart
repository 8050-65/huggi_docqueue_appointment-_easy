// lib/shared/extensions/string_ext.dart
extension StringFormatting on String {
  /// Format phone number: 9876543210 -> (987) 654-3210
  /// or +919876543210 -> +91 (987) 654-3210
  String formatPhoneNumber() {
    if (isEmpty) return this;

    final isE164 = startsWith('+');
    final cleanDigits = replaceAll(RegExp('[^0-9]'), '');

    if (cleanDigits.length < 10) return this;

    if (isE164 && cleanDigits.length == 12) {
      // +919876543210 -> +91 (987) 654-3210
      final countryCode = cleanDigits.substring(0, 2);
      final areaCode = cleanDigits.substring(2, 5);
      final first = cleanDigits.substring(5, 8);
      final second = cleanDigits.substring(8);
      return '+$countryCode ($areaCode) $first-$second';
    }

    // 9876543210 -> (987) 654-3210
    final areaCode = cleanDigits.substring(0, 3);
    final first = cleanDigits.substring(3, 6);
    final second = cleanDigits.substring(6);
    return '($areaCode) $first-$second';
  }

  /// Normalize phone: +919876543210 -> 9876543210
  String normalizePhone() {
    return replaceAll(RegExp('[^0-9]'), '').replaceFirst(RegExp('^91'), '');
  }

  /// Check if string is a valid 10-digit phone
  bool isValidPhone() {
    final cleaned = normalizePhone();
    return cleaned.length == 10 && RegExp(r'^[0-9]{10}$').hasMatch(cleaned);
  }
}
