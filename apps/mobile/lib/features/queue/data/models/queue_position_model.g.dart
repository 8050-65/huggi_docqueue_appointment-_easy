// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'queue_position_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

QueueAppointmentSnapshotModel _$QueueAppointmentSnapshotModelFromJson(
        Map<String, dynamic> json) =>
    QueueAppointmentSnapshotModel(
      id: json['id'] as String,
      appointmentTime: DateTime.parse(json['appointmentTime'] as String),
      doctor: DoctorModel.fromJson(json['doctor'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$QueueAppointmentSnapshotModelToJson(
        QueueAppointmentSnapshotModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'appointmentTime': instance.appointmentTime.toIso8601String(),
      'doctor': instance.doctor,
    };

QueuePositionModel _$QueuePositionModelFromJson(Map<String, dynamic> json) =>
    QueuePositionModel(
      queueId: json['queueId'] as String,
      position: (json['position'] as num).toInt(),
      status: json['status'] as String,
      calledAt: json['calledAt'] == null
          ? null
          : DateTime.parse(json['calledAt'] as String),
      consultationStartedAt: json['consultationStartedAt'] == null
          ? null
          : DateTime.parse(json['consultationStartedAt'] as String),
      appointment: QueueAppointmentSnapshotModel.fromJson(
          json['appointment'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$QueuePositionModelToJson(QueuePositionModel instance) =>
    <String, dynamic>{
      'queueId': instance.queueId,
      'position': instance.position,
      'status': instance.status,
      'calledAt': instance.calledAt?.toIso8601String(),
      'consultationStartedAt':
          instance.consultationStartedAt?.toIso8601String(),
      'appointment': instance.appointment,
    };
