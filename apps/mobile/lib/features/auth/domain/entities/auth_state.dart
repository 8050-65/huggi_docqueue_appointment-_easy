// lib/features/auth/domain/entities/auth_state.dart
sealed class AuthState {
  const AuthState();
}

class AuthLoading extends AuthState {
  final String message;
  const AuthLoading({this.message = 'Loading...'});
}

class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

class AuthAuthenticated extends AuthState {
  final PatientProfile patient;
  const AuthAuthenticated(this.patient);
}

class AuthError extends AuthState {
  final String message;
  final String? code;
  const AuthError(this.message, {this.code});
}

class PatientProfile {
  final String id;
  final String name;
  final String phone;
  final String clinicId;

  const PatientProfile({
    required this.id,
    required this.name,
    required this.phone,
    required this.clinicId,
  });
}
