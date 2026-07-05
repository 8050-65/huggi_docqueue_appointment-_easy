// lib/features/appointments/data/datasources/appointment_remote_datasource.dart
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/appointment_model.dart';
import 'package:dio/dio.dart';

class AppointmentRemoteDataSource {
  final DioClient _dio;

  AppointmentRemoteDataSource(this._dio);

  Future<List<AppointmentModel>> getMyAppointments() async {
    try {
      final response = await _dio.get('/appointments/mine');
      final list = response.data as List;
      return list
          .map((item) => AppointmentModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<void> cancelAppointment(String appointmentId) async {
    try {
      await _dio.post(
        '/appointments/$appointmentId/cancel',
      );
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<void> rescheduleAppointment(String appointmentId, DateTime newTime) async {
    try {
      await _dio.post(
        '/appointments/$appointmentId/reschedule',
        data: {'newTime': newTime.toIso8601String()},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }
}
