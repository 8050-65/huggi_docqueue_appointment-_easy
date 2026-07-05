// lib/features/queue/data/datasources/queue_remote_datasource.dart
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../models/queue_position_model.dart';
import 'package:dio/dio.dart';

class QueueRemoteDataSource {
  final DioClient _dio;

  QueueRemoteDataSource(this._dio);

  Future<QueuePositionModel?> getMyQueuePosition() async {
    try {
      final response = await _dio.get('/queue/my-position');
      if (response.data == null) return null;
      return QueuePositionModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }
}
