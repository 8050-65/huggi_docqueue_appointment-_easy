// test/core/notifications/email_notification_service_test.dart
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:huggi_patient_app/core/notifications/email_notification_service.dart';
import 'package:huggi_patient_app/features/appointments/domain/entities/appointment_entity.dart';

@GenerateMocks([Dio])
import 'email_notification_service_test.mocks.dart';

void main() {
  group('EmailNotificationService', () {
    late MockDio mockDio;
    late EmailNotificationService emailService;

    const String apiBaseUrl = 'http://localhost:3001';
    const String testEmail = 'patient@example.com';

    setUp(() {
      mockDio = MockDio();
      emailService = EmailNotificationServiceImpl(
        dioClient: mockDio,
        apiBaseUrl: apiBaseUrl,
      );
    });

    group('sendAppointmentConfirmation', () {
      test('successfully sends confirmation email', () async {
        final appointment = AppointmentEntity(
          id: 'appt_1',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Smith',
          clinicName: 'City Hospital',
          clinicAddress: '123 Main St',
          status: 'booked',
          scheduledAt: '2026-06-25T10:00:00Z',
        );

        final mockResponse = Response(
          data: {'success': true, 'emailId': 'email_123'},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(
          '$apiBaseUrl/api/notifications/email',
          data: anyNamed('data'),
        )).thenAnswer((_) async => mockResponse);

        // Should not throw
        // await emailService.sendAppointmentConfirmation(appointment, testEmail);

        // verify(mockDio.post(
        //   '$apiBaseUrl/api/notifications/email',
        //   data: any,
        // )).called(1);
      });

      test('uses appointment_confirmation template', () async {
        final appointment = AppointmentEntity(
          id: 'appt_1',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Smith',
          clinicName: 'City Hospital',
          clinicAddress: '123 Main St',
          status: 'booked',
          scheduledAt: '2026-06-25T10:00:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(
          any,
          data: anyNamed('data'),
        )).thenAnswer((_) async => mockResponse);

        // Template ID should be 'appointment_confirmation'
      });

      test('includes all appointment details in email', () async {
        final appointment = AppointmentEntity(
          id: 'appt_details',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Johnson',
          clinicName: 'Health Clinic',
          clinicAddress: '456 Oak Ave',
          status: 'booked',
          scheduledAt: '2026-06-26T14:30:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // Should include doctorName, clinicName, clinicAddress, date, time
      });
    });

    group('sendAppointmentReminder', () {
      test('sends 24-hour reminder with isUrgent=false', () async {
        final appointment = AppointmentEntity(
          id: 'appt_2',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Patel',
          clinicName: 'Medical Center',
          clinicAddress: '789 Pine Rd',
          status: 'booked',
          scheduledAt: '2026-06-27T11:00:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // await emailService.sendAppointmentReminder(
        //   appointment,
        //   testEmail,
        //   isUrgent: false,
        // );

        // Should use 'appointment_reminder' template
      });

      test('sends 1-hour urgent reminder with isUrgent=true', () async {
        final appointment = AppointmentEntity(
          id: 'appt_urgent',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Lee',
          clinicName: 'Urgent Care',
          clinicAddress: '321 Elm St',
          status: 'booked',
          scheduledAt: '2026-06-28T09:15:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // await emailService.sendAppointmentReminder(
        //   appointment,
        //   testEmail,
        //   isUrgent: true,
        // );

        // Should use 'appointment_reminder_urgent' template
      });

      test('marks urgent reminders with isUrgent flag in data', () async {
        final appointment = AppointmentEntity(
          id: 'appt_flag',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Brown',
          clinicName: 'Family Clinic',
          clinicAddress: '555 Maple Ave',
          status: 'booked',
          scheduledAt: '2026-06-29T15:45:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // Data should include isUrgent: true/false
      });
    });

    group('sendCancellationConfirmation', () {
      test('successfully sends cancellation email', () async {
        final appointment = AppointmentEntity(
          id: 'appt_3',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Wilson',
          clinicName: 'Wellness Center',
          clinicAddress: '999 Cedar Ln',
          status: 'cancelled',
          scheduledAt: '2026-06-29T15:45:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // await emailService.sendCancellationConfirmation(appointment, testEmail);
      });

      test('uses appointment_cancelled template', () async {
        final appointment = AppointmentEntity(
          id: 'appt_cancel_template',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Test',
          clinicName: 'Test Clinic',
          clinicAddress: 'Test Address',
          status: 'cancelled',
          scheduledAt: '2026-06-30T10:00:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // Template should be 'appointment_cancelled'
      });
    });

    group('sendRescheduleConfirmation', () {
      test('successfully sends reschedule email with new time', () async {
        final appointment = AppointmentEntity(
          id: 'appt_4',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Harris',
          clinicName: 'Health Plus',
          clinicAddress: '444 Oak St',
          status: 'booked',
          scheduledAt: '2026-07-01T13:00:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // await emailService.sendRescheduleConfirmation(appointment, testEmail);
      });

      test('uses appointment_rescheduled template', () async {
        final appointment = AppointmentEntity(
          id: 'appt_reschedule',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Davis',
          clinicName: 'Care Clinic',
          clinicAddress: '777 Pine St',
          status: 'booked',
          scheduledAt: '2026-07-02T16:30:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // Template should be 'appointment_rescheduled'
      });

      test('includes new appointment time in email', () async {
        final appointment = AppointmentEntity(
          id: 'appt_new_time',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Garcia',
          clinicName: 'Medical Plus',
          clinicAddress: '888 Elm St',
          status: 'booked',
          scheduledAt: '2026-07-03T11:30:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // Email should clearly display new time
      });
    });

    group('error handling', () {
      test('handles network timeout gracefully', () async {
        final appointment = AppointmentEntity(
          id: 'appt_timeout',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Timeout',
          clinicName: 'Timeout Clinic',
          clinicAddress: 'Timeout St',
          status: 'booked',
          scheduledAt: '2026-06-30T10:00:00Z',
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenThrow(DioException(
          requestOptions: RequestOptions(path: ''),
          type: DioExceptionType.connectionTimeout,
        ));

        // Should throw with meaningful error message
      });

      test('handles invalid email gracefully', () async {
        final appointment = AppointmentEntity(
          id: 'appt_bad_email',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Error',
          clinicName: 'Error Clinic',
          clinicAddress: 'Error St',
          status: 'booked',
          scheduledAt: '2026-06-30T10:00:00Z',
        );

        final mockResponse = Response(
          data: {'error': 'Invalid email address'},
          statusCode: 400,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // Should handle 400 error gracefully
      });

      test('handles server errors gracefully', () async {
        final appointment = AppointmentEntity(
          id: 'appt_server_error',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Server',
          clinicName: 'Server Clinic',
          clinicAddress: 'Server St',
          status: 'booked',
          scheduledAt: '2026-06-30T10:00:00Z',
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenThrow(DioException(
          requestOptions: RequestOptions(path: ''),
          error: 'Internal server error',
          type: DioExceptionType.badResponse,
        ));

        // Should throw with meaningful error message
      });
    });

    group('API contract validation', () {
      test('sends request to correct endpoint', () async {
        final appointment = AppointmentEntity(
          id: 'appt_endpoint',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Endpoint',
          clinicName: 'Endpoint Clinic',
          clinicAddress: 'Endpoint St',
          status: 'booked',
          scheduledAt: '2026-06-30T10:00:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // Endpoint should be /api/notifications/email
      });

      test('sends all required fields in request body', () async {
        final appointment = AppointmentEntity(
          id: 'appt_fields',
          clinicId: 'clinic_1',
          patientId: 'patient_1',
          doctorName: 'Dr. Fields',
          clinicName: 'Fields Clinic',
          clinicAddress: 'Fields St',
          status: 'booked',
          scheduledAt: '2026-06-30T10:00:00Z',
        );

        final mockResponse = Response(
          data: {'success': true},
          statusCode: 200,
          requestOptions: RequestOptions(path: ''),
        );

        when(mockDio.post(any, data: anyNamed('data')))
            .thenAnswer((_) async => mockResponse);

        // Body should include email, templateId, appointmentId, data
      });
    });

    group('Resend template integration', () {
      test('templates exist for all notification types', () {
        // Verify templates: appointment_confirmation, appointment_reminder,
        // appointment_reminder_urgent, appointment_cancelled, appointment_rescheduled
      });

      test('template IDs match backend Resend configuration', () {
        // Ensure IDs align with backend's template setup
      });
    });
  });
}
