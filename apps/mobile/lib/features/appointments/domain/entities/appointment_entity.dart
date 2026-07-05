// lib/features/appointments/domain/entities/appointment_entity.dart
class AppointmentEntity {
  final String id;
  final String doctorId;
  final String doctorName;
  final String clinicId;
  final DateTime appointmentTime;
  final Duration duration;
  final String status;
  final String? notes;

  const AppointmentEntity({
    required this.id,
    required this.doctorId,
    required this.doctorName,
    required this.clinicId,
    required this.appointmentTime,
    required this.duration,
    required this.status,
    this.notes,
  });
}
