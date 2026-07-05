// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'appointment_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DoctorUserModel _$DoctorUserModelFromJson(Map<String, dynamic> json) =>
    DoctorUserModel(
      id: json['id'] as String,
      name: json['name'] as String,
    );

Map<String, dynamic> _$DoctorUserModelToJson(DoctorUserModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
    };

DoctorModel _$DoctorModelFromJson(Map<String, dynamic> json) => DoctorModel(
      id: json['id'] as String,
      specialization: json['specialization'] as String,
      consultationDuration: (json['consultationDuration'] as num).toInt(),
      user: DoctorUserModel.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$DoctorModelToJson(DoctorModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'specialization': instance.specialization,
      'consultationDuration': instance.consultationDuration,
      'user': instance.user,
    };

AppointmentModel _$AppointmentModelFromJson(Map<String, dynamic> json) =>
    AppointmentModel(
      id: json['id'] as String,
      appointmentTime: DateTime.parse(json['appointmentTime'] as String),
      status: json['status'] as String,
      notes: json['notes'] as String?,
      clinicId: json['clinicId'] as String,
      doctor: DoctorModel.fromJson(json['doctor'] as Map<String, dynamic>),
      duration: _durationFromJson((json['duration'] as num).toInt()),
    );

Map<String, dynamic> _$AppointmentModelToJson(AppointmentModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'appointmentTime': instance.appointmentTime.toIso8601String(),
      'status': instance.status,
      'notes': instance.notes,
      'clinicId': instance.clinicId,
      'doctor': instance.doctor,
      'duration': _durationToJson(instance.duration),
    };
