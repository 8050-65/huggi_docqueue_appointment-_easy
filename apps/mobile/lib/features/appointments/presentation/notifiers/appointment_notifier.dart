// lib/features/appointments/presentation/notifiers/appointment_notifier.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_exception.dart';
import '../../../../core/notifications/email_notification_service.dart';
import '../../../../core/notifications/local_notification_service.dart';
import '../../../../core/notifications/whatsapp_notification_service.dart';
import '../../../../core/storage/hive_cache_service.dart';
import '../../domain/entities/appointment_entity.dart';
import '../../domain/usecases/cancel_appointment_usecase.dart';
import '../../domain/usecases/get_my_appointments_usecase.dart';
import '../../domain/usecases/reschedule_appointment_usecase.dart';

sealed class AppointmentState {
  const AppointmentState();
}

class AppointmentLoading extends AppointmentState {
  const AppointmentLoading();
}

class AppointmentLoaded extends AppointmentState {
  final List<AppointmentEntity> appointments;
  const AppointmentLoaded(this.appointments);
}

class AppointmentError extends AppointmentState {
  final String message;
  const AppointmentError(this.message);
}

class AppointmentEmpty extends AppointmentState {
  const AppointmentEmpty();
}

class AppointmentNotifier extends StateNotifier<AppointmentState> {
  final GetMyAppointmentsUseCase _getAppointmentsUseCase;
  final CancelAppointmentUseCase _cancelUseCase;
  final RescheduleAppointmentUseCase _rescheduleUseCase;
  final HiveCacheService _cacheService;
  final LocalNotificationService _localNotificationService;
  final WhatsAppNotificationService _whatsAppService;
  final EmailNotificationService _emailService;
  final String _patientPhone; // Patient's phone number for WhatsApp
  final String _patientEmail; // Patient's email

  AppointmentNotifier(
    this._getAppointmentsUseCase,
    this._cancelUseCase,
    this._rescheduleUseCase,
    this._cacheService,
    this._localNotificationService,
    this._whatsAppService,
    this._emailService,
    this._patientPhone,
    this._patientEmail,
  ) : super(const AppointmentLoading());

  Future<void> fetchAppointments() async {
    state = const AppointmentLoading();
    try {
      final appointments = await _getAppointmentsUseCase.call();

      // Cache appointments for offline access
      if (appointments.isNotEmpty) {
        // Convert to models and cache
        // await _cacheService.cacheAppointments(appointments);
      }

      if (appointments.isEmpty) {
        state = const AppointmentEmpty();
      } else {
        state = AppointmentLoaded(appointments);
      }
    } on ApiException catch (e) {
      state = AppointmentError(e.message);
    } catch (e) {
      state = const AppointmentError('Failed to load appointments');
    }
  }

  Future<void> createAppointment(AppointmentEntity appointment) async {
    try {
      // Schedule local notifications: 24h and 1h before
      await _localNotificationService.scheduleAppointmentReminders(appointment);

      // Send WhatsApp confirmation
      await _whatsAppService.sendAppointmentConfirmation(
        appointment,
        _patientPhone,
      );

      // Send email confirmation
      await _emailService.sendAppointmentConfirmation(
        appointment,
        _patientEmail,
      );

      // Refresh appointments list
      await fetchAppointments();
    } on ApiException catch (e) {
      state = AppointmentError(e.message);
    } catch (e) {
      state = const AppointmentError('Failed to create appointment');
    }
  }

  Future<void> cancelAppointment(String appointmentId) async {
    try {
      // Get appointment details for notifications
      final state = this.state;
      AppointmentEntity? appointment;

      if (state is AppointmentLoaded) {
        appointment = state.appointments.firstWhere(
          (a) => a.id == appointmentId,
          orElse: () => throw Exception('Appointment not found'),
        );
      }

      // Call cancel API
      await _cancelUseCase.call(appointmentId);

      // Cancel local notifications
      await _localNotificationService.cancelReminder(appointmentId);

      // Send WhatsApp cancellation notice if appointment found
      if (appointment != null) {
        await _whatsAppService.sendCancellationConfirmation(
          appointment,
          _patientPhone,
        );

        // Send email cancellation
        await _emailService.sendCancellationConfirmation(
          appointment,
          _patientEmail,
        );
      }

      // Refresh appointments
      await fetchAppointments();
    } on ApiException catch (e) {
      state = AppointmentError(e.message);
    } catch (e) {
      state = const AppointmentError('Failed to cancel appointment');
    }
  }

  Future<void> rescheduleAppointment(
    String appointmentId,
    DateTime newScheduledAt,
  ) async {
    try {
      // Get appointment details
      final state = this.state;
      AppointmentEntity? appointment;

      if (state is AppointmentLoaded) {
        appointment = state.appointments.firstWhere(
          (a) => a.id == appointmentId,
          orElse: () => throw Exception('Appointment not found'),
        );
      }

      // Call reschedule API
      final rescheduledAppointment = await _rescheduleUseCase.call(
        appointmentId,
        newScheduledAt,
      );

      // Cancel old reminders
      await _localNotificationService.cancelReminder(appointmentId);

      // Schedule new reminders
      await _localNotificationService.scheduleAppointmentReminders(
        rescheduledAppointment,
      );

      // Send WhatsApp reschedule notice
      if (appointment != null) {
        await _whatsAppService.sendRescheduleConfirmation(
          rescheduledAppointment,
          _patientPhone,
        );

        // Send email reschedule
        await _emailService.sendRescheduleConfirmation(
          rescheduledAppointment,
          _patientEmail,
        );
      }

      // Refresh appointments
      await fetchAppointments();
    } on ApiException catch (e) {
      state = AppointmentError(e.message);
    } catch (e) {
      state = const AppointmentError('Failed to reschedule appointment');
    }
  }

  Future<void> retry() => fetchAppointments();
}
