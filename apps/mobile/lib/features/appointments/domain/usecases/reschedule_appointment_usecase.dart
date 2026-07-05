// lib/features/appointments/domain/usecases/reschedule_appointment_usecase.dart
import '../repositories/appointment_repository.dart';

class RescheduleAppointmentUseCase {
  final AppointmentRepository _repository;

  RescheduleAppointmentUseCase(this._repository);

  Future<void> call(String appointmentId, DateTime newTime) async {
    await _repository.rescheduleAppointment(appointmentId, newTime);
  }
}
