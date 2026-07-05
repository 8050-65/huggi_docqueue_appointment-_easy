// lib/features/appointments/presentation/providers/appointment_providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/network/network_provider.dart';
import '../../../../core/notifications/email_notification_service.dart';
import '../../../../core/notifications/local_notification_service.dart';
import '../../../../core/notifications/whatsapp_notification_service.dart';
import '../../../../core/storage/hive_cache_service.dart';
import '../../data/datasources/appointment_remote_datasource.dart';
import '../../data/repositories/appointment_repository_impl.dart';
import '../../domain/usecases/cancel_appointment_usecase.dart';
import '../../domain/usecases/get_my_appointments_usecase.dart';
import '../../domain/usecases/reschedule_appointment_usecase.dart';
import '../notifiers/appointment_details_notifier.dart';
import '../notifiers/appointment_notifier.dart';

// API base URL (update to production URL when deploying)
const String _apiBaseUrl = 'http://localhost:3001';

final appointmentRemoteDataSourceProvider = Provider((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return AppointmentRemoteDataSource(dioClient);
});

final appointmentRepositoryProvider = Provider((ref) {
  final dataSource = ref.watch(appointmentRemoteDataSourceProvider);
  final cacheService = ref.watch(hiveCacheServiceProvider);
  return AppointmentRepositoryImpl(dataSource, cacheService: cacheService);
});

final getMyAppointmentsUseCaseProvider = Provider((ref) {
  final repository = ref.watch(appointmentRepositoryProvider);
  return GetMyAppointmentsUseCase(repository);
});

final cancelAppointmentUseCaseProvider = Provider((ref) {
  final repository = ref.watch(appointmentRepositoryProvider);
  return CancelAppointmentUseCase(repository);
});

final rescheduleAppointmentUseCaseProvider = Provider((ref) {
  final repository = ref.watch(appointmentRepositoryProvider);
  return RescheduleAppointmentUseCase(repository);
});

// Hive Cache Service
final hiveCacheServiceProvider = Provider<HiveCacheService>((ref) {
  return HiveCacheServiceImpl();
});

// Local Notification Service
final localNotificationServiceProvider = Provider<LocalNotificationService>((ref) {
  return LocalNotificationServiceImpl();
});

// WhatsApp Notification Service
final whatsAppNotificationServiceProvider = Provider<WhatsAppNotificationService>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return WhatsAppNotificationServiceImpl(
    dioClient: dioClient,
    apiBaseUrl: _apiBaseUrl,
  );
});

// Email Notification Service
final emailNotificationServiceProvider = Provider<EmailNotificationService>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return EmailNotificationServiceImpl(
    dioClient: dioClient,
    apiBaseUrl: _apiBaseUrl,
  );
});

final myAppointmentsProvider =
    StateNotifierProvider.autoDispose<AppointmentNotifier, AppointmentState>(
  (ref) {
    final getAppointmentsUseCase = ref.watch(getMyAppointmentsUseCaseProvider);
    final cancelUseCase = ref.watch(cancelAppointmentUseCaseProvider);
    final rescheduleUseCase = ref.watch(rescheduleAppointmentUseCaseProvider);
    final cacheService = ref.watch(hiveCacheServiceProvider);
    final localNotifService = ref.watch(localNotificationServiceProvider);
    final whatsAppService = ref.watch(whatsAppNotificationServiceProvider);
    final emailService = ref.watch(emailNotificationServiceProvider);

    // Get patient contact info from auth state
    final currentPatient = ref.watch(currentPatientProvider);
    final patientPhone = currentPatient?.phoneNumber ?? '+919999999999';
    final patientEmail = currentPatient?.email ?? 'patient@huggi.local';

    return AppointmentNotifier(
      getAppointmentsUseCase,
      cancelUseCase,
      rescheduleUseCase,
      cacheService,
      localNotifService,
      whatsAppService,
      emailService,
      patientPhone,
      patientEmail,
    );
  },
);

// Provider for appointment details screen
// Passes the main notifier so that cancel/reschedule trigger notifications
final appointmentDetailsProvider = StateNotifierProvider.family<
    AppointmentDetailsNotifier,
    AppointmentDetailsState,
    AppointmentEntity>(
  (ref, appointment) {
    final cancelUseCase = ref.watch(cancelAppointmentUseCaseProvider);
    final rescheduleUseCase = ref.watch(rescheduleAppointmentUseCaseProvider);

    return AppointmentDetailsNotifier(
      appointment,
      cancelUseCase,
      rescheduleUseCase,
      mainAppointmentProvider: myAppointmentsProvider,
      ref: ref,
    );
  },
);
