// lib/features/appointments/data/models/appointment_model.dart
import 'package:json_annotation/json_annotation.dart';

import '../../domain/entities/appointment_entity.dart';

part 'appointment_model.g.dart';

@JsonSerializable()
class DoctorUserModel {
  final String id;
  final String name;

  DoctorUserModel({
    required this.id,
    required this.name,
  });

  factory DoctorUserModel.fromJson(Map<String, dynamic> json) =>
      _$DoctorUserModelFromJson(json);

  Map<String, dynamic> toJson() => _$DoctorUserModelToJson(this);
}

@JsonSerializable()
class DoctorModel {
  final String id;
  final String specialization;
  final int consultationDuration;
  final DoctorUserModel user;

  DoctorModel({
    required this.id,
    required this.specialization,
    required this.consultationDuration,
    required this.user,
  });

  factory DoctorModel.fromJson(Map<String, dynamic> json) =>
      _$DoctorModelFromJson(json);

  Map<String, dynamic> toJson() => _$DoctorModelToJson(this);
}

@JsonSerializable()
class AppointmentModel {
  final String id;
  final DateTime appointmentTime;
  final String status; // booked, cancelled, done
  final String? notes;
  final String clinicId;
  final DoctorModel doctor;
  @JsonKey(fromJson: _durationFromJson, toJson: _durationToJson)
  final Duration duration;

  AppointmentModel({
    required this.id,
    required this.appointmentTime,
    required this.status,
    this.notes,
    required this.clinicId,
    required this.doctor,
    required this.duration,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) =>
      _$AppointmentModelFromJson(json);

  Map<String, dynamic> toJson() => _$AppointmentModelToJson(this);

  AppointmentEntity toEntity() => AppointmentEntity(
        id: id,
        doctorId: doctor.id,
        doctorName: doctor.user.name,
        clinicId: clinicId,
        appointmentTime: appointmentTime,
        duration: duration,
        status: status,
        notes: notes,
      );
}

Duration _durationFromJson(int minutes) => Duration(minutes: minutes);
int _durationToJson(Duration duration) => duration.inMinutes;
