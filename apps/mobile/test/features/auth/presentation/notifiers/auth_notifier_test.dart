// test/features/auth/presentation/notifiers/auth_notifier_test.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:huggi_patient_app/features/auth/domain/entities/auth_state.dart';
import 'package:huggi_patient_app/features/auth/domain/repositories/auth_repository.dart';
import 'package:huggi_patient_app/features/auth/presentation/notifiers/auth_notifier.dart';
import 'package:mocktail/mocktail.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  group('AuthNotifier', () {
    late MockAuthRepository mockRepository;
    late AuthNotifier authNotifier;

    setUp(() {
      mockRepository = MockAuthRepository();
      authNotifier = AuthNotifier(mockRepository);
    });

    test('initial state is unauthenticated', () {
      expect(authNotifier.state, isA<AuthUnauthenticated>());
    });

    test('patientLogin sets authenticated state on success', () async {
      final profile = PatientProfile(
        id: 'patient-1',
        name: 'John Doe',
        phone: '9876543210',
        clinicId: 'clinic-1',
      );

      when(() => mockRepository.patientLogin(any())).thenAnswer((_) async {});
      when(() => mockRepository.getMyProfile()).thenAnswer((_) async => profile);

      await authNotifier.patientLogin('test-token');

      expect(authNotifier.state, isA<AuthAuthenticated>());
      if (authNotifier.state is AuthAuthenticated) {
        final auth = authNotifier.state as AuthAuthenticated;
        expect(auth.patient.name, 'John Doe');
      }
    });

    test('patientLogin sets error state on failure', () async {
      when(() => mockRepository.patientLogin(any()))
          .thenThrow(Exception('Login failed'));

      await authNotifier.patientLogin('invalid-token');

      expect(authNotifier.state, isA<AuthError>());
    });

    test('logout clears state', () async {
      when(() => mockRepository.logout()).thenAnswer((_) async {});

      await authNotifier.logout();

      expect(authNotifier.state, isA<AuthUnauthenticated>());
    });

    test('setError updates state with error message', () {
      authNotifier.setError('Test error message');

      expect(authNotifier.state, isA<AuthError>());
      if (authNotifier.state is AuthError) {
        final error = authNotifier.state as AuthError;
        expect(error.message, 'Test error message');
      }
    });
  });
}
