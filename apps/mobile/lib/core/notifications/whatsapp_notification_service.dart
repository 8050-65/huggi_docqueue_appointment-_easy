// lib/core/notifications/whatsapp_notification_service.dart
import 'package:dio/dio.dart';
import 'package:huggi_patient_app/features/appointments/domain/entities/appointment_entity.dart';

abstract class WhatsAppNotificationService {
  Future<void> sendAppointmentConfirmation(
    AppointmentEntity appointment,
    String phoneNumber,
  );
  Future<void> sendAppointmentReminder(
    AppointmentEntity appointment,
    String phoneNumber,
  );
  Future<void> sendCancellationConfirmation(
    AppointmentEntity appointment,
    String phoneNumber,
  );
  Future<void> sendRescheduleConfirmation(
    AppointmentEntity appointment,
    String phoneNumber,
  );
}

class WhatsAppNotificationServiceImpl implements WhatsAppNotificationService {
  final Dio _dioClient;
  final String _apiBaseUrl;

  WhatsAppNotificationServiceImpl({
    required Dio dioClient,
    required String apiBaseUrl,
  })  : _dioClient = dioClient,
        _apiBaseUrl = apiBaseUrl;

  @override
  Future<void> sendAppointmentConfirmation(
    AppointmentEntity appointment,
    String phoneNumber,
  ) async {
    try {
      await _sendNotification(
        phoneNumber: phoneNumber,
        messageType: 'appointment_confirmation',
        appointmentId: appointment.id,
        data: {
          'doctorName': appointment.doctorName,
          'date': appointment.scheduledAt,
          'time': _formatTime(appointment.scheduledAt),
          'clinicName': appointment.clinicName,
        },
      );
    } catch (e) {
      throw Exception('Failed to send WhatsApp confirmation: $e');
    }
  }

  @override
  Future<void> sendAppointmentReminder(
    AppointmentEntity appointment,
    String phoneNumber,
  ) async {
    try {
      await _sendNotification(
        phoneNumber: phoneNumber,
        messageType: 'appointment_reminder',
        appointmentId: appointment.id,
        data: {
          'doctorName': appointment.doctorName,
          'date': appointment.scheduledAt,
          'time': _formatTime(appointment.scheduledAt),
          'clinicName': appointment.clinicName,
        },
      );
    } catch (e) {
      throw Exception('Failed to send WhatsApp reminder: $e');
    }
  }

  @override
  Future<void> sendCancellationConfirmation(
    AppointmentEntity appointment,
    String phoneNumber,
  ) async {
    try {
      await _sendNotification(
        phoneNumber: phoneNumber,
        messageType: 'appointment_cancelled',
        appointmentId: appointment.id,
        data: {
          'doctorName': appointment.doctorName,
          'date': appointment.scheduledAt,
          'time': _formatTime(appointment.scheduledAt),
          'clinicName': appointment.clinicName,
        },
      );
    } catch (e) {
      throw Exception('Failed to send WhatsApp cancellation: $e');
    }
  }

  @override
  Future<void> sendRescheduleConfirmation(
    AppointmentEntity appointment,
    String phoneNumber,
  ) async {
    try {
      await _sendNotification(
        phoneNumber: phoneNumber,
        messageType: 'appointment_rescheduled',
        appointmentId: appointment.id,
        data: {
          'doctorName': appointment.doctorName,
          'date': appointment.scheduledAt,
          'time': _formatTime(appointment.scheduledAt),
          'clinicName': appointment.clinicName,
        },
      );
    } catch (e) {
      throw Exception('Failed to send WhatsApp reschedule confirmation: $e');
    }
  }

  Future<void> _sendNotification({
    required String phoneNumber,
    required String messageType,
    required String appointmentId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await _dioClient.post(
        '$_apiBaseUrl/api/notifications/whatsapp',
        data: {
          'phoneNumber': phoneNumber,
          'messageType': messageType,
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
        'WhatsApp notification failed: ${e.message ?? "Unknown error"}',
      );
    } catch (e) {
      throw Exception('Failed to send WhatsApp notification: $e');
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
