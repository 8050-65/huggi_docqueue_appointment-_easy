// lib/features/auth/presentation/providers/auth_providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/auth/firebase_auth_datasource.dart';
import '../../../../core/network/network_provider.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/auth_state.dart';
import '../../domain/repositories/auth_repository.dart';
import '../notifiers/auth_notifier.dart';
import '../notifiers/phone_input_notifier.dart';

// Repository
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  final storage = ref.watch(secureStorageProvider);
  final remote = AuthRemoteDataSource(dioClient);
  return AuthRepositoryImpl(remote, storage);
});

// Auth state notifier
final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthNotifier(repository);
});

// Derived providers
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authNotifierProvider) is AuthAuthenticated;
});

final isLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authNotifierProvider) is AuthLoading;
});

final authErrorProvider = Provider<String?>((ref) {
  final state = ref.watch(authNotifierProvider);
  if (state is AuthError) {
    return state.message;
  }
  return null;
});

final currentPatientProvider = Provider<PatientProfile?>((ref) {
  final state = ref.watch(authNotifierProvider);
  if (state is AuthAuthenticated) {
    return state.patient;
  }
  return null;
});

// Firebase OTP Auth Datasource
final firebaseAuthProvider = Provider<FirebaseAuthDatasource>((ref) {
  return FirebaseAuthDatasourceImpl();
});

// Phone input notifier
final phoneInputProvider =
    StateNotifierProvider.autoDispose<PhoneInputNotifier, PhoneInputState>((ref) {
  return PhoneInputNotifier();
});
