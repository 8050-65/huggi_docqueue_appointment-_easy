// lib/core/storage/secure_storage.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:device_info_plus/device_info_plus.dart';

class SecureStorage {
  static const String _accessTokenKey = 'huggi_access_token';
  static const String _refreshTokenKey = 'huggi_refresh_token';
  static const String _deviceIdKey = 'huggi_device_id';

  final FlutterSecureStorage _storage;

  SecureStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
    ]);
  }

  Future<String?> getAccessToken() async {
    return _storage.read(key: _accessTokenKey);
  }

  Future<String?> getRefreshToken() async {
    return _storage.read(key: _refreshTokenKey);
  }

  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _refreshTokenKey),
    ]);
  }

  Future<String> getOrCreateDeviceId() async {
    var stored = await _storage.read(key: _deviceIdKey);
    if (stored != null) return stored;

    // Generate device ID from device info
    final deviceInfo = DeviceInfoPlugin();
    final id = await _generateDeviceId(deviceInfo);
    await _storage.write(key: _deviceIdKey, value: id);
    return id;
  }

  Future<String> _generateDeviceId(DeviceInfoPlugin deviceInfo) async {
    try {
      // Generate a simple device ID from device info
      final uuid = DateTime.now().millisecondsSinceEpoch.toString();
      return 'device_$uuid';
    } catch (_) {
      return 'device_${DateTime.now().millisecondsSinceEpoch}';
    }
  }
}
