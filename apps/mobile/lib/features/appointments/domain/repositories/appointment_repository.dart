// lib/features/appointments/domain/repositories/appointment_repository.dart
import '../entities/appointment_entity.dart';

abstract class AppointmentRepository {
  /// Fetch patient's appointments
  /// Throws [ApiException] on error
  Future<List<AppointmentEntity>> getMyAppointments();

  /// Cancel an appointment
  /// Throws [ApiException] on error
  Future<void> cancelAppointment(String appointmentId);

  /// Reschedule appointment to new time
  /// Throws [ApiException] on error
  Future<void> rescheduleAppointment(String appointmentId, DateTime newTime);
}
