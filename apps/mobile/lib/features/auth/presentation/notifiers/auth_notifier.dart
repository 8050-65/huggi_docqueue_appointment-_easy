// lib/features/auth/presentation/notifiers/auth_notifier.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_exception.dart';
import '../../domain/entities/auth_state.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;

  AuthNotifier(this._repository) : super(const AuthUnauthenticated());

  /// Attempt to restore session from stored tokens
  Future<void> restoreSession() async {
    state = const AuthLoading(message: 'Restoring session...');
    try {
      final profile = await _repository.restoreSession();
      if (profile != null) {
        state = AuthAuthenticated(profile);
      } else {
        state = const AuthUnauthenticated();
      }
    } catch (e) {
      state = const AuthUnauthenticated();
    }
  }

  /// Login with Firebase ID token
  Future<void> patientLogin(String idToken) async {
    state = const AuthLoading(message: 'Signing in...');
    try {
      await _repository.patientLogin(idToken);
      final profile = await _repository.getMyProfile();
      state = AuthAuthenticated(profile);
    } on ApiException catch (e) {
      state = AuthError(e.message, code: 'LOGIN_FAILED');
    } catch (e) {
      state = AuthError('An unexpected error occurred', code: 'UNKNOWN_ERROR');
    }
  }

  /// Logout
  Future<void> logout() async {
    state = const AuthLoading(message: 'Logging out...');
    try {
      await _repository.logout();
      state = const AuthUnauthenticated();
    } catch (e) {
      // Clear state anyway
      state = const AuthUnauthenticated();
    }
  }

  /// Refresh access token
  Future<void> refreshAccessToken() async {
    try {
      await _repository.refreshToken();
      final profile = await _repository.getMyProfile();
      state = AuthAuthenticated(profile);
    } on ApiException {
      state = AuthError('Session expired. Please log in again.', code: 'REFRESH_FAILED');
      await logout();
    }
  }

  /// Update state to error
  void setError(String message, {String? code}) {
    state = AuthError(message, code: code);
  }

  /// Clear error and reset to unauthenticated
  void clearError() {
    state = const AuthUnauthenticated();
  }
}
