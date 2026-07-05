// lib/config/app_config.dart
class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3001/api',
  );

  static const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'development',
  );

  static const bool debugLogging = true;

  // Queue polling configuration
  static const Duration queuePollingIntervalWifi = Duration(seconds: 5);
  static const Duration queuePollingIntervalMobile = Duration(seconds: 10);
  static const Duration appointmentsCacheTtl = Duration(minutes: 2);
  static const Duration queueCacheTtl = Duration(seconds: 30);

  // Network timeouts
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 10);

  // Auth
  static const int tokenRefreshThresholdSeconds = 60;
  static const int refreshTokenRotationSeconds = 604800; // 7 days
}
