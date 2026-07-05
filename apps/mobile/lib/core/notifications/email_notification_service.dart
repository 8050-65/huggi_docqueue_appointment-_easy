// lib/core/notifications/email_notification_service.dart
import 'package:dio/dio.dart';
import 'package:huggi_patient_app/features/appointments/domain/entities/appointment_entity.dart';

abstract class EmailNotificationService {
  Future<void> sendAppointmentConfirmation(
    AppointmentEntity appointment,
    String email,
  );
  Future<void> sendAppointmentReminder(
    AppointmentEntity appointment,
    String email, {
    required bool isUrgent,
  });
  Future<void> sendCancellationConfirmation(
    AppointmentEntity appointment,
    String email,
  );
  Future<void> sendRescheduleConfirmation(
    AppointmentEntity appointment,
    String email,
  );
}

class EmailNotificationServiceImpl implements EmailNotificationService {
  final Dio _dioClient;
  final String _apiBaseUrl;

  EmailNotificationServiceImpl({
    required Dio dioClient,
    required String apiBaseUrl,
  })  : _dioClient = dioClient,
        _apiBaseUrl = apiBaseUrl;

  @override
  Future<void> sendAppointmentConfirmation(
    AppointmentEntity appointment,
    String email,
  ) async {
    try {
      await _sendNotification(
        email: email,
        templateId: 'appointment_confirmation',
        appointmentId: appointment.id,
        data: {
          'doctorName': appointment.doctorName,
          'date': appointment.scheduledAt,
          'time': _formatTime(appointment.scheduledAt),
          'clinicName': appointment.clinicName,
          'clinicAddress': appointment.clinicAddress,
        },
      );
    } catch (e) {
      throw Exception('Failed to send email confirmation: $e');
    }
  }

  @override
  Future<void> sendAppointmentReminder(
    AppointmentEntity appointment,
    String email, {
    required bool isUrgent,
  }) async {
    try {
      await _sendNotification(
        email: email,
        templateId: isUrgent ? 'appointment_reminder_urgent' : 'appointment_reminder',
        appointmentId: appointment.id,
        data: {
          'doctorName': appointment.doctorName,
          'date': appointment.scheduledAt,
          'time': _formatTime(appointment.scheduledAt),
          'clinicName': appointment.clinicName,
          'clinicAddress': appointment.clinicAddress,
          'isUrgent': isUrgent,
        },
      );
    } catch (e) {
      throw Exception('Failed to send email reminder: $e');
    }
  }

  @override
  Future<void> sendCancellationConfirmation(
    AppointmentEntity appointment,
    String email,
  ) async {
    try {
      await _sendNotification(
        email: email,
        templateId: 'appointment_cancelled',
        appointmentId: appointment.id,
        data: {
          'doctorName': appointment.doctorName,
          'date': appointment.scheduledAt,
          'time': _formatTime(appointment.scheduledAt),
          'clinicName': appointment.clinicName,
        },
      );
    } catch (e) {
      throw Exception('Failed to send cancellation email: $e');
    }
  }

  @override
  Future<void> sendRescheduleConfirmation(
    AppointmentEntity appointment,
    String email,
  ) async {
    try {
      await _sendNotification(
        email: email,
        templateId: 'appointment_rescheduled',
        appointmentId: appointment.id,
        data: {
          'doctorName': appointment.doctorName,
          'date': appointment.scheduledAt,
          'time': _formatTime(appointment.scheduledAt),
          'clinicName': appointment.clinicName,
          'clinicAddress': appointment.clinicAddress,
        },
      );
    } catch (e) {
      throw Exception('Failed to send reschedule email: $e');
    }
  }

  Future<void> _sendNotification({
    required String email,
    required String templateId,
    required String appointmentId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await _dioClient.post(
        '$_apiBaseUrl/api/notifications/email',
        data: {
          'email': email,
          'templateId': templateId,
          'appointmentId': appointmentId,
          'data': data,
        },
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw DioException(
          requestOptions: response.requestOptions,
          response: response,
          type: DioExceptionType.badResponse,
          error: 'Failed with status ${response.statusCode}',
        );
      }
    } on DioException catch (e) {
      throw Exception(
        'Email notification failed: ${e.message ?? "Unknown error"}',
      );
    } catch (e) {
      throw Exception('Failed to send email notification: $e');
    }
  }

  String _formatTime(String dateTimeString) {
    try {
      final dateTime = DateTime.parse(dateTimeString);
      return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return 'Unknown time';
    }
  }
}
