// lib/features/appointments/data/repositories/appointment_repository_impl.dart
import '../../../../core/storage/hive_cache_service.dart';
import '../../domain/entities/appointment_entity.dart';
import '../../domain/repositories/appointment_repository.dart';
import '../datasources/appointment_remote_datasource.dart';

class AppointmentRepositoryImpl implements AppointmentRepository {
  final AppointmentRemoteDataSource _remoteDataSource;
  final HiveCacheService? _cacheService;

  AppointmentRepositoryImpl(this._remoteDataSource, {HiveCacheService? cacheService})
      : _cacheService = cacheService;

  @override
  Future<List<AppointmentEntity>> getMyAppointments() async {
    try {
      // Try to fetch from API
      final models = await _remoteDataSource.getMyAppointments();
      final entities = models.map((model) => model.toEntity()).toList();

      // Cache on success for offline access
      if (_cacheService != null && entities.isNotEmpty) {
        try {
          await _cacheService!.cacheAppointments(models);
        } catch (e) {
          // Log cache error but don't break the flow
          print('Warning: Failed to cache appointments: $e');
        }
      }

      return entities;
    } catch (e) {
      // Fallback to cache if API fails
      if (_cacheService != null) {
        try {
          final cachedModels = await _cacheService!.getAppointments();
          if (cachedModels != null && cachedModels.isNotEmpty) {
            return cachedModels.map((model) => model.toEntity()).toList();
          }
        } catch (cacheError) {
          // Log cache error but rethrow original API error
          print('Warning: Failed to load from cache: $cacheError');
        }
      }
      rethrow;
    }
  }

  @override
  Future<void> cancelAppointment(String appointmentId) async {
    await _remoteDataSource.cancelAppointment(appointmentId);
  }

  @override
  Future<void> rescheduleAppointment(String appointmentId, DateTime newTime) async {
    await _remoteDataSource.rescheduleAppointment(appointmentId, newTime);
  }
}
