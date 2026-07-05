// lib/features/auth/data/repositories/auth_repository_impl.dart
import 'package:jwt_decoder/jwt_decoder.dart';

import '../../../../core/network/api_exception.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../domain/entities/auth_state.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remote;
  final SecureStorage _storage;

  AuthRepositoryImpl(this._remote, this._storage);

  @override
  Future<void> patientLogin(String idToken) async {
    final tokens = await _remote.patientLogin(idToken);
    await _storage.saveTokens(tokens.accessToken, tokens.refreshToken);
  }

  @override
  Future<void> refreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null) throw ApiException(message: 'No refresh token stored');

    final tokens = await _remote.refreshToken(refreshToken);
    await _storage.saveTokens(tokens.accessToken, tokens.refreshToken);
  }

  @override
  Future<void> logout() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken != null) {
      try {
        await _remote.logout(refreshToken);
      } catch (_) {
        // Ignore error; clear tokens locally anyway
      }
    }
    await _storage.clearTokens();
  }

  @override
  Future<PatientProfile> getMyProfile() async {
    final patient = await _remote.getMyProfile();
    return PatientProfile(
      id: patient.id,
      name: patient.user.name,
      phone: patient.user.phone,
      clinicId: patient.clinicId,
    );
  }

  @override
  Future<bool> hasValidToken() async {
    final token = await _storage.getAccessToken();
    if (token == null) return false;

    try {
      return !JwtDecoder.isExpired(token);
    } catch (_) {
      return false;
    }
  }

  @override
  Future<bool> hasRefreshToken() async {
    final token = await _storage.getRefreshToken();
    return token != null;
  }

  @override
  Future<PatientProfile?> restoreSession() async {
    final hasValid = await hasValidToken();
    if (hasValid) {
      try {
        return await getMyProfile();
      } catch (_) {
        // Token invalid; try refresh
      }
    }

    final hasRefresh = await hasRefreshToken();
    if (!hasRefresh) return null;

    try {
      await refreshToken();
      return await getMyProfile();
    } catch (_) {
      // Refresh failed; clear tokens
      await logout();
      return null;
    }
  }
}
