// lib/features/appointments/domain/usecases/cancel_appointment_usecase.dart
import '../repositories/appointment_repository.dart';

class CancelAppointmentUseCase {
  final AppointmentRepository _repository;

  CancelAppointmentUseCase(this._repository);

  Future<void> call(String appointmentId) async {
    await _repository.cancelAppointment(appointmentId);
  }
}
