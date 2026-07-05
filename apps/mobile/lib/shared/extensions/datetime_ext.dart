// lib/shared/extensions/datetime_ext.dart
import 'package:intl/intl.dart';

extension DateTimeFormatting on DateTime {
  String toUserFriendlyTime() {
    return DateFormat('MMM d, h:mm a').format(toLocal());
  }

  String toDateOnly() {
    return DateFormat('MMM d, yyyy').format(toLocal());
  }

  String toTimeOnly() {
    return DateFormat('h:mm a').format(toLocal());
  }

  bool isToday() {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }
}
