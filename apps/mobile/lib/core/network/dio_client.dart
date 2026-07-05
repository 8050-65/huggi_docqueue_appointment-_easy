// lib/core/network/dio_client.dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../config/app_config.dart';
import '../storage/secure_storage.dart';

class DioClient {
  late final Dio _dio;
  final SecureStorage _storage;
  Future<void>? _refreshPromise;
  VoidCallback? _onSessionExpired;

  DioClient(this._storage) {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        contentType: 'application/json',
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
      ),
    );

    // Token injection interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            try {
              await _refreshAccessToken();
              // Retry original request
              return handler.resolve(
                await _dio.request(
                  error.requestOptions.path,
                  options: Options(
                    method: error.requestOptions.method,
                    headers: error.requestOptions.headers,
                  ),
                  data: error.requestOptions.data,
                  queryParameters: error.requestOptions.queryParameters,
                ),
              );
            } catch (_) {
              // Refresh failed — clear tokens and notify
              await _storage.clearTokens();
              _onSessionExpired?.call();
              return handler.reject(
                DioException(
                  requestOptions: error.requestOptions,
                  type: DioExceptionType.badResponse,
                  error: 'Session expired. Please log in again.',
                ),
              );
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  void setOnSessionExpired(VoidCallback callback) {
    _onSessionExpired = callback;
  }

  Future<void> _refreshAccessToken() async {
    // Serialize concurrent 401s to avoid multiple refresh requests
    _refreshPromise ??= _doRefresh();
    try {
      await _refreshPromise;
    } finally {
      _refreshPromise = null;
    }
  }

  Future<void> _doRefresh() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null) throw Exception('No refresh token');

    try {
      final response = await _dio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final accessToken = response.data['accessToken'] as String?;
      final newRefreshToken = response.data['refreshToken'] as String?;

      if (accessToken != null && newRefreshToken != null) {
        await _storage.saveTokens(accessToken, newRefreshToken);
      } else {
        throw Exception('Missing tokens in refresh response');
      }
    } catch (e) {
      rethrow;
    }
  }

  // Public HTTP methods
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) =>
      _dio.get<T>(path, queryParameters: queryParameters);

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) =>
      _dio.post<T>(path, data: data, queryParameters: queryParameters);

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) =>
      _dio.patch<T>(path, data: data, queryParameters: queryParameters);

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) =>
      _dio.delete<T>(path, data: data, queryParameters: queryParameters);
}
