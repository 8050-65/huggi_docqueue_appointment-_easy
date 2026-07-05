// lib/core/network/api_exception.dart
import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic originalError;

  ApiException({
    required this.message,
    this.statusCode,
    this.originalError,
  });

  factory ApiException.fromDioException(DioException e) {
    final statusCode = e.response?.statusCode;
    final message = _mapStatusCodeToMessage(statusCode, e.message);
    return ApiException(
      message: message,
      statusCode: statusCode,
      originalError: e,
    );
  }

  static String _mapStatusCodeToMessage(int? statusCode, String? defaultMessage) {
    return switch (statusCode) {
      400 => 'Invalid request. Please check your input.',
      401 => 'Your session expired. Please log in again.',
      403 => 'You do not have access to this resource.',
      404 => 'Resource not found.',
      409 => 'This action is not allowed (conflict).',
      500 => 'Server error. Please try again later.',
      502 => 'Service temporarily unavailable.',
      503 => 'Service maintenance. Please try again soon.',
      null => defaultMessage ?? 'An error occurred. Please try again.',
      _ => 'An unexpected error occurred. Please try again.',
    };
  }

  @override
  String toString() => 'ApiException: $message (status: $statusCode)';
}
