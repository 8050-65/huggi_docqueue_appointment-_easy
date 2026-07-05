// lib/features/queue/data/models/queue_position_model.dart
import 'package:json_annotation/json_annotation.dart';
import '../../../appointments/data/models/appointment_model.dart';
import '../../domain/entities/queue_position_entity.dart';

part 'queue_position_model.g.dart';

@JsonSerializable()
class QueueAppointmentSnapshotModel {
  final String id;
  final DateTime appointmentTime;
  final DoctorModel doctor;

  QueueAppointmentSnapshotModel({
    required this.id,
    required this.appointmentTime,
    required this.doctor,
  });

  factory QueueAppointmentSnapshotModel.fromJson(Map<String, dynamic> json) =>
      _$QueueAppointmentSnapshotModelFromJson(json);

  Map<String, dynamic> toJson() => _$QueueAppointmentSnapshotModelToJson(this);
}

@JsonSerializable()
class QueuePositionModel {
  final String queueId;
  final int position;
  final String status; // waiting, called, in_consultation, done, no_show
  @JsonKey(defaultValue: null)
  final DateTime? calledAt;
  @JsonKey(defaultValue: null)
  final DateTime? consultationStartedAt;
  final QueueAppointmentSnapshotModel appointment;

  QueuePositionModel({
    required this.queueId,
    required this.position,
    required this.status,
    this.calledAt,
    this.consultationStartedAt,
    required this.appointment,
  });

  factory QueuePositionModel.fromJson(Map<String, dynamic> json) =>
      _$QueuePositionModelFromJson(json);

  Map<String, dynamic> toJson() => _$QueuePositionModelToJson(this);

  QueuePositionEntity toEntity() => QueuePositionEntity(
        patientId: '', // Will be set from auth context
        queueId: queueId,
        positionNumber: position,
        doctorName: appointment.doctor.user.name,
        tokenTime: appointment.appointmentTime,
        status: status,
      );
}
