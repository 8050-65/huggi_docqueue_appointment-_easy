// lib/features/auth/data/datasources/auth_remote_datasource.dart
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/auth_tokens_model.dart';
import '../models/patient_model.dart';
import 'package:dio/dio.dart';

class AuthRemoteDataSource {
  final DioClient _dio;

  AuthRemoteDataSource(this._dio);

  Future<AuthTokensModel> patientLogin(String idToken) async {
    try {
      final response = await _dio.post(
        '/auth/patient/login',
        data: {'idToken': idToken},
      );
      return AuthTokensModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<AuthTokensModel> refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      return AuthTokensModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<void> logout(String refreshToken) async {
    try {
      await _dio.post(
        '/auth/logout',
        data: {'refreshToken': refreshToken},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<PatientModel> getMyProfile() async {
    try {
      final response = await _dio.get('/patients/me');
      return PatientModel.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }
}
