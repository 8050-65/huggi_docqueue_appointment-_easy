// lib/core/storage/hive_cache_service.dart
import 'package:hive_flutter/hive_flutter.dart';
import 'package:huggi_patient_app/features/appointments/data/models/appointment_model.dart';
import 'package:huggi_patient_app/features/queue/data/models/queue_position_model.dart';
import 'package:huggi_patient_app/features/auth/data/models/patient_model.dart';

abstract class HiveCacheService {
  Future<void> init();

  // Appointment cache
  Future<void> cacheAppointments(List<AppointmentModel> appointments);
  Future<List<AppointmentModel>?> getAppointments();
  Future<void> clearAppointments();

  // Queue position cache
  Future<void> cacheQueuePosition(QueuePositionModel queuePosition);
  Future<QueuePositionModel?> getQueuePosition();
  Future<void> clearQueuePosition();

  // Patient profile cache
  Future<void> cachePatientProfile(PatientModel patient);
  Future<PatientModel?> getPatientProfile();
  Future<void> clearPatientProfile();

  // Generic cache clear
  Future<void> clearAll();
}

class HiveCacheServiceImpl implements HiveCacheService {
  late Box<AppointmentModel> _appointmentsBox;
  late Box<QueuePositionModel> _queueBox;
  late Box<PatientModel> _profileBox;

  static const String _appointmentsBoxName = 'appointments';
  static const String _queueBoxName = 'queue_position';
  static const String _profileBoxName = 'patient_profile';

  @override
  Future<void> init() async {
    try {
      // Initialize Hive
      await Hive.initFlutter();

      // Register adapters for models
      if (!Hive.isAdapterRegistered(0)) {
        Hive.registerAdapter(AppointmentModelAdapter());
      }
      if (!Hive.isAdapterRegistered(1)) {
        Hive.registerAdapter(QueuePositionModelAdapter());
      }
      if (!Hive.isAdapterRegistered(2)) {
        Hive.registerAdapter(PatientModelAdapter());
      }

      // Open boxes
      _appointmentsBox = await Hive.openBox<AppointmentModel>(_appointmentsBoxName);
      _queueBox = await Hive.openBox<QueuePositionModel>(_queueBoxName);
      _profileBox = await Hive.openBox<PatientModel>(_profileBoxName);
    } catch (e) {
      throw Exception('Failed to initialize Hive cache: $e');
    }
  }

  @override
  Future<void> cacheAppointments(List<AppointmentModel> appointments) async {
    try {
      await _appointmentsBox.clear();
      for (int i = 0; i < appointments.length; i++) {
        await _appointmentsBox.put(i, appointments[i]);
      }
    } catch (e) {
      throw Exception('Failed to cache appointments: $e');
    }
  }

  @override
  Future<List<AppointmentModel>?> getAppointments() async {
    try {
      if (_appointmentsBox.isEmpty) {
        return null;
      }
      return _appointmentsBox.values.toList();
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> clearAppointments() async {
    try {
      await _appointmentsBox.clear();
    } catch (e) {
      throw Exception('Failed to clear appointments cache: $e');
    }
  }

  @override
  Future<void> cacheQueuePosition(QueuePositionModel queuePosition) async {
    try {
      await _queueBox.put('current', queuePosition);
    } catch (e) {
      throw Exception('Failed to cache queue position: $e');
    }
  }

  @override
  Future<QueuePositionModel?> getQueuePosition() async {
    try {
      return _queueBox.get('current');
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> clearQueuePosition() async {
    try {
      await _queueBox.delete('current');
    } catch (e) {
      throw Exception('Failed to clear queue position cache: $e');
    }
  }

  @override
  Future<void> cachePatientProfile(PatientModel patient) async {
    try {
      await _profileBox.put('profile', patient);
    } catch (e) {
      throw Exception('Failed to cache patient profile: $e');
    }
  }

  @override
  Future<PatientModel?> getPatientProfile() async {
    try {
      return _profileBox.get('profile');
    } catch (e) {
      return null;
    }
  }

  @override
  Future<void> clearPatientProfile() async {
    try {
      await _profileBox.delete('profile');
    } catch (e) {
      throw Exception('Failed to clear patient profile cache: $e');
    }
  }

  @override
  Future<void> clearAll() async {
    try {
      await _appointmentsBox.clear();
      await _queueBox.clear();
      await _profileBox.clear();
    } catch (e) {
      throw Exception('Failed to clear all cache: $e');
    }
  }
}
