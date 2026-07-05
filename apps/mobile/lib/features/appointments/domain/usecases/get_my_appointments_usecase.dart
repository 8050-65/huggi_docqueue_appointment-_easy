// lib/features/appointments/domain/usecases/get_my_appointments_usecase.dart
import '../entities/appointment_entity.dart';
import '../repositories/appointment_repository.dart';

class GetMyAppointmentsUseCase {
  final AppointmentRepository _repository;

  GetMyAppointmentsUseCase(this._repository);

  Future<List<AppointmentEntity>> call() async {
    final appointments = await _repository.getMyAppointments();
    appointments.sort((a, b) => a.appointmentTime.compareTo(b.appointmentTime));
    return appointments;
  }
}
