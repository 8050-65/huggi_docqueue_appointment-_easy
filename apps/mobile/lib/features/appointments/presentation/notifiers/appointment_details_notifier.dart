// lib/features/appointments/presentation/notifiers/appointment_details_notifier.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_exception.dart';
import '../../domain/entities/appointment_entity.dart';
import '../../domain/usecases/cancel_appointment_usecase.dart';
import '../../domain/usecases/reschedule_appointment_usecase.dart';
import 'appointment_notifier.dart';

sealed class AppointmentDetailsState {
  const AppointmentDetailsState();
}

class AppointmentDetailsLoading extends AppointmentDetailsState {
  const AppointmentDetailsLoading();
}

class AppointmentDetailsLoaded extends AppointmentDetailsState {
  final AppointmentEntity appointment;
  const AppointmentDetailsLoaded(this.appointment);
}

class AppointmentDetailsCancelling extends AppointmentDetailsState {
  final AppointmentEntity appointment;
  const AppointmentDetailsCancelling(this.appointment);
}

class AppointmentDetailsCancelled extends AppointmentDetailsState {
  const AppointmentDetailsCancelled();
}

class AppointmentDetailsRescheduling extends AppointmentDetailsState {
  final AppointmentEntity appointment;
  const AppointmentDetailsRescheduling(this.appointment);
}

class AppointmentDetailsError extends AppointmentDetailsState {
  final String message;
  final AppointmentEntity? appointment;
  const AppointmentDetailsError(this.message, {this.appointment});
}

class AppointmentDetailsNotifier extends StateNotifier<AppointmentDetailsState> {
  final AppointmentEntity appointment;
  final CancelAppointmentUseCase _cancelUseCase;
  final RescheduleAppointmentUseCase _rescheduleUseCase;
  final StateNotifierProvider<AppointmentNotifier, AppointmentState>?
      _mainAppointmentProvider;
  final StateNotifierProviderRef? _ref;

  AppointmentDetailsNotifier(
    this.appointment,
    this._cancelUseCase,
    this._rescheduleUseCase, {
    StateNotifierProvider<AppointmentNotifier, AppointmentState>?
        mainAppointmentProvider,
    StateNotifierProviderRef? ref,
  })  : _mainAppointmentProvider = mainAppointmentProvider,
        _ref = ref,
        super(AppointmentDetailsLoaded(appointment));

  bool get canCancel =>
      appointment.status == 'booked' || appointment.status == 'called';

  bool get canReschedule => appointment.status == 'booked';

  Future<void> cancelAppointment() async {
    final current = state;
    if (current is! AppointmentDetailsLoaded) return;

    state = AppointmentDetailsCancelling(appointment);
    try {
      // Call main notifier to trigger notifications (WhatsApp, Email, etc.)
      if (_ref != null && _mainAppointmentProvider != null) {
        await _ref!.read(_mainAppointmentProvider!.notifier).cancelAppointment(appointment.id);
      } else {
        // Fallback to direct use case call (without notifications)
        await _cancelUseCase.call(appointment.id);
      }
      state = const AppointmentDetailsCancelled();
    } on ApiException catch (e) {
      state = AppointmentDetailsError(e.message, appointment: appointment);
    } catch (e) {
      state = const AppointmentDetailsError('Failed to cancel appointment');
    }
  }

  Future<void> rescheduleAppointment(DateTime newTime) async {
    state = AppointmentDetailsRescheduling(appointment);
    try {
      // Call main notifier to trigger notifications (WhatsApp, Email, etc.)
      if (_ref != null && _mainAppointmentProvider != null) {
        await _ref!.read(_mainAppointmentProvider!.notifier).rescheduleAppointment(
          appointment.id,
          newTime,
        );
        final updated = appointment.copyWith(appointmentTime: newTime);
        state = AppointmentDetailsLoaded(updated);
      } else {
        // Fallback to direct use case call (without notifications)
        await _rescheduleUseCase.call(appointment.id, newTime);
        final updated = appointment.copyWith(appointmentTime: newTime);
        state = AppointmentDetailsLoaded(updated);
      }
    } on ApiException catch (e) {
      state = AppointmentDetailsError(e.message, appointment: appointment);
    } catch (e) {
      state = const AppointmentDetailsError('Failed to reschedule appointment');
    }
  }
}

extension AppointmentEntityCopyWith on AppointmentEntity {
  AppointmentEntity copyWith({
    String? id,
    String? doctorId,
    String? doctorName,
    String? clinicId,
    DateTime? appointmentTime,
    Duration? duration,
    String? status,
    String? notes,
  }) {
    return AppointmentEntity(
      id: id ?? this.id,
      doctorId: doctorId ?? this.doctorId,
      doctorName: doctorName ?? this.doctorName,
      clinicId: clinicId ?? this.clinicId,
      appointmentTime: appointmentTime ?? this.appointmentTime,
      duration: duration ?? this.duration,
      status: status ?? this.status,
      notes: notes ?? this.notes,
    );
  }
}
