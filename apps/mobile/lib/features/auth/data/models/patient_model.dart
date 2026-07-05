// lib/features/auth/data/models/patient_model.dart
import 'package:json_annotation/json_annotation.dart';

part 'patient_model.g.dart';

@JsonSerializable()
class UserInfoModel {
  final String id;
  final String name;
  final String phone;

  UserInfoModel({
    required this.id,
    required this.name,
    required this.phone,
  });

  factory UserInfoModel.fromJson(Map<String, dynamic> json) =>
      _$UserInfoModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserInfoModelToJson(this);
}

@JsonSerializable()
class PatientModel {
  final String id;
  final String clinicId;
  final String? notes;
  final bool isActive;
  final UserInfoModel user;

  PatientModel({
    required this.id,
    required this.clinicId,
    this.notes,
    required this.isActive,
    required this.user,
  });

  factory PatientModel.fromJson(Map<String, dynamic> json) =>
      _$PatientModelFromJson(json);

  Map<String, dynamic> toJson() => _$PatientModelToJson(this);
}
