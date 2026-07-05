// lib/core/notifications/local_notification_service.dart
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:huggi_patient_app/features/appointments/domain/entities/appointment_entity.dart';
import 'package:timezone/timezone.dart' as tz;

abstract class LocalNotificationService {
  Future<void> init();
  Future<void> scheduleAppointmentReminders(AppointmentEntity appointment);
  Future<void> cancelReminder(String appointmentId);
  Future<void> cancelAllReminders();
}

class LocalNotificationServiceImpl implements LocalNotificationService {
  final FlutterLocalNotificationsPlugin _notificationsPlugin;

  // Notification IDs: appointmentId + suffix (1 for 24h, 2 for 1h)
  static const String _24hSuffix = '_24h';
  static const String _1hSuffix = '_1h';

  LocalNotificationServiceImpl({FlutterLocalNotificationsPlugin? notificationsPlugin})
      : _notificationsPlugin = notificationsPlugin ?? FlutterLocalNotificationsPlugin();

  @override
  Future<void> init() async {
    try {
      const AndroidInitializationSettings androidSettings =
          AndroidInitializationSettings('mipmap/ic_launcher');
      const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
        requestSoundPermission: true,
        requestBadgePermission: true,
        requestAlertPermission: true,
      );

      const InitializationSettings settings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );

      await _notificationsPlugin.initialize(
        settings,
        onDidReceiveNotificationResponse: _handleNotificationTap,
      );

      // Request iOS permissions
      await _notificationsPlugin
          .resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>()
          ?.requestPermissions(alert: true, badge: true, sound: true);
    } catch (e) {
      throw Exception('Failed to initialize local notifications: $e');
    }
  }

  @override
  Future<void> scheduleAppointmentReminders(AppointmentEntity appointment) async {
    try {
      final appointmentTime = DateTime.parse(appointment.scheduledAt);

      // Schedule 24-hour reminder
      final time24hBefore = appointmentTime.subtract(const Duration(days: 1));
      await _scheduleReminder(
        notificationId: int.parse(appointment.id.replaceAll(RegExp(r'[^0-9]'), '').padRight(10, '0').substring(0, 10)),
        title: 'Appointment Reminder',
        body: 'Your appointment with Dr. ${appointment.doctorName} is tomorrow at ${_formatTime(appointmentTime)}',
        scheduledDate: time24hBefore,
        appointmentId: appointment.id,
        payload: appointment.id,
      );

      // Schedule 1-hour reminder
      final time1hBefore = appointmentTime.subtract(const Duration(hours: 1));
      await _scheduleReminder(
        notificationId: int.parse(appointment.id.replaceAll(RegExp(r'[^0-9]'), '').padRight(10, '0').substring(0, 10)) + 1,
        title: 'Appointment Soon!',
        body: 'Your appointment with Dr. ${appointment.doctorName} starts in 1 hour at ${_formatTime(appointmentTime)}',
        scheduledDate: time1hBefore,
        appointmentId: appointment.id,
        payload: appointment.id,
      );
    } catch (e) {
      throw Exception('Failed to schedule appointment reminders: $e');
    }
  }

  Future<void> _scheduleReminder({
    required int notificationId,
    required String title,
    required String body,
    required DateTime scheduledDate,
    required String appointmentId,
    required String payload,
  }) async {
    try {
      final tzScheduledDate = tz.TZDateTime.from(scheduledDate, tz.local);

      await _notificationsPlugin.zonedSchedule(
        notificationId,
        title,
        body,
        tzScheduledDate,
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'appointment_channel',
            'Appointment Reminders',
            channelDescription: 'Notifications for upcoming appointments',
            importance: Importance.high,
            priority: Priority.high,
            enableVibration: true,
            sound: RawResourceAndroidNotificationSound('notification_sound'),
          ),
          iOS: DarwinNotificationDetails(
            sound: 'default',
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        androidAllowWhileIdle: true,
        uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.wallClockTime,
        payload: payload,
      );
    } catch (e) {
      throw Exception('Failed to schedule reminder notification: $e');
    }
  }

  @override
  Future<void> cancelReminder(String appointmentId) async {
    try {
      final baseId = int.parse(appointmentId.replaceAll(RegExp(r'[^0-9]'), '').padRight(10, '0').substring(0, 10));
      await _notificationsPlugin.cancel(baseId); // Cancel 24h reminder
      await _notificationsPlugin.cancel(baseId + 1); // Cancel 1h reminder
    } catch (e) {
      throw Exception('Failed to cancel reminder: $e');
    }
  }

  @override
  Future<void> cancelAllReminders() async {
    try {
      await _notificationsPlugin.cancelAll();
    } catch (e) {
      throw Exception('Failed to cancel all reminders: $e');
    }
  }

  void _handleNotificationTap(NotificationResponse response) {
    // Handle notification tap - navigate to appointment details
    final appointmentId = response.payload;
    if (appointmentId != null && appointmentId.isNotEmpty) {
      // TODO: Navigate to appointment details using GoRouter
      // context.go('/appointments/$appointmentId');
    }
  }

  String _formatTime(DateTime dateTime) {
    return '${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
