// lib/features/auth/domain/repositories/auth_repository.dart
import '../entities/auth_state.dart';

abstract class AuthRepository {
  /// Login patient with Firebase ID token
  /// Throws [ApiException] on failure
  Future<void> patientLogin(String idToken);

  /// Refresh access token using refresh token
  /// Throws [ApiException] on failure
  Future<void> refreshToken();

  /// Logout and revoke refresh token
  /// Throws [ApiException] on failure
  Future<void> logout();

  /// Get authenticated patient's profile
  /// Throws [ApiException] on failure
  Future<PatientProfile> getMyProfile();

  /// Check if user has valid access token
  Future<bool> hasValidToken();

  /// Check if user has refresh token
  Future<bool> hasRefreshToken();

  /// Restore session from stored tokens
  /// Returns null if no valid tokens found
  Future<PatientProfile?> restoreSession();
}
