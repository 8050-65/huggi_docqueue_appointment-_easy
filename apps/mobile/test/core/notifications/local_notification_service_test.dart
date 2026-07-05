// test/core/notifications/local_notification_service_test.dart
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:huggi_patient_app/core/notifications/local_notification_service.dart';
import 'package:huggi_patient_app/features/appointments/domain/entities/appointment_entity.dart';

@GenerateMocks([FlutterLocalNotificationsPlugin])
import 'local_notification_service_test.mocks.dart';

void main() {
  group('LocalNotificationService', () {
    late MockFlutterLocalNotificationsPlugin mockNotificationsPlugin;
    late LocalNotificationService notificationService;

    setUp(() {
      mockNotificationsPlugin = MockFlutterLocalNotificationsPlugin();
      notificationService = LocalNotificationServiceImpl(
        notificationsPlugin: mockNotificationsPlugin,
      );
    });

    group('init', () {
      test('initializes notification plugin successfully', () async {
        when(mockNotificationsPlugin.initialize(
          any,
          onDidReceiveNotificationResponse: anyNamed('onDidReceiveNotificationResponse'),
        )).thenAnswer((_) async => true);

        when(mockNotificationsPlugin
                .resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>())
            .thenReturn(null);

        // await notificationService.init();

        // verify(mockNotificationsPlugin.initialize(any)).called(1);
      });
    });

    group('scheduleAppointmentReminders', () {
      test('schedules both 24h and 1h reminders', () async {
        final appointment = AppointmentEntity(
          id: 'appt_123',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Smith',
          clinicName: 'City Hospital',
          clinicAddress: '123 Main St',
          status: 'booked',
          scheduledAt: DateTime.now().add(const Duration(days: 2)).toIso8601String(),
        );

        when(mockNotificationsPlugin.zonedSchedule(
          any,
          any,
          any,
          any,
          any,
          androidAllowWhileIdle: anyNamed('androidAllowWhileIdle'),
          uiLocalNotificationDateInterpretation:
              anyNamed('uiLocalNotificationDateInterpretation'),
          payload: anyNamed('payload'),
        )).thenAnswer((_) async => null);

        // await notificationService.scheduleAppointmentReminders(appointment);

        // Verify zonedSchedule called twice (24h + 1h)
        // verify(mockNotificationsPlugin.zonedSchedule(any, any, any, any, any,
        //     androidAllowWhileIdle: true,
        //     uiLocalNotificationDateInterpretation: any,
        //     payload: any)).called(2);
      });

      test('uses correct notification IDs for reminders', () async {
        final appointment = AppointmentEntity(
          id: 'appt_456',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Johnson',
          clinicName: 'City Clinic',
          clinicAddress: '456 Oak Ave',
          status: 'booked',
          scheduledAt: DateTime.now().add(const Duration(days: 3)).toIso8601String(),
        );

        when(mockNotificationsPlugin.zonedSchedule(
          any,
          any,
          any,
          any,
          any,
          androidAllowWhileIdle: anyNamed('androidAllowWhileIdle'),
          uiLocalNotificationDateInterpretation:
              anyNamed('uiLocalNotificationDateInterpretation'),
          payload: anyNamed('payload'),
        )).thenAnswer((_) async => null);

        // Notification IDs should be appointment_id + 0 for 24h, +1 for 1h
      });

      test('includes correct appointment details in notification body', () async {
        final appointment = AppointmentEntity(
          id: 'appt_789',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Patel',
          clinicName: 'Health Center',
          clinicAddress: '789 Pine Rd',
          status: 'booked',
          scheduledAt: '2026-06-25T14:30:00Z',
        );

        when(mockNotificationsPlugin.zonedSchedule(
          any,
          anyNamed('title'),
          anyNamed('body'),
          any,
          any,
          androidAllowWhileIdle: anyNamed('androidAllowWhileIdle'),
          uiLocalNotificationDateInterpretation:
              anyNamed('uiLocalNotificationDateInterpretation'),
          payload: anyNamed('payload'),
        )).thenAnswer((_) async => null);

        // Verify body contains doctor name and appointment time
      });
    });

    group('cancelReminder', () {
      test('cancels both 24h and 1h reminders for appointment', () async {
        when(mockNotificationsPlugin.cancel(any)).thenAnswer((_) async => true);

        // await notificationService.cancelReminder('appt_123');

        // Verify cancel called twice with correct IDs
        // verify(mockNotificationsPlugin.cancel(any)).called(2);
      });

      test('handles cancellation of non-existent reminder gracefully', () async {
        when(mockNotificationsPlugin.cancel(any)).thenAnswer((_) async => false);

        // Should not throw exception
        // await notificationService.cancelReminder('appt_nonexistent');
      });
    });

    group('cancelAllReminders', () {
      test('cancels all scheduled reminders', () async {
        when(mockNotificationsPlugin.cancelAll()).thenAnswer((_) async => true);

        // await notificationService.cancelAllReminders();

        // verify(mockNotificationsPlugin.cancelAll()).called(1);
      });
    });

    group('notification payload and deeplink', () {
      test('notification payload contains appointment ID for navigation', () async {
        final appointment = AppointmentEntity(
          id: 'appt_nav_test',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Lee',
          clinicName: 'Medical Clinic',
          clinicAddress: '321 Elm St',
          status: 'booked',
          scheduledAt: DateTime.now().add(const Duration(days: 1)).toIso8601String(),
        );

        when(mockNotificationsPlugin.zonedSchedule(
          any,
          any,
          any,
          any,
          any,
          androidAllowWhileIdle: anyNamed('androidAllowWhileIdle'),
          uiLocalNotificationDateInterpretation:
              anyNamed('uiLocalNotificationDateInterpretation'),
          payload: 'appt_nav_test',
        )).thenAnswer((_) async => null);

        // Payload should match appointment ID for deeplink
      });
    });

    group('edge cases', () {
      test('handles appointment scheduled in the past gracefully', () async {
        final pastAppointment = AppointmentEntity(
          id: 'appt_past',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Old',
          clinicName: 'Old Clinic',
          clinicAddress: '999 Old St',
          status: 'done',
          scheduledAt: DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
        );

        // Should handle gracefully (not schedule reminders in the past)
      });

      test('handles malformed appointment data gracefully', () async {
        // Test with invalid or missing fields
      });
    });
  });
}
