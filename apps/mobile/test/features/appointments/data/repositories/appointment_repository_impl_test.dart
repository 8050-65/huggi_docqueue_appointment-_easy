// test/features/appointments/data/repositories/appointment_repository_impl_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:huggi_patient_app/features/appointments/data/datasources/appointment_remote_datasource.dart';
import 'package:huggi_patient_app/features/appointments/data/models/appointment_model.dart';
import 'package:huggi_patient_app/features/appointments/data/repositories/appointment_repository_impl.dart';
import 'package:mocktail/mocktail.dart';

class MockAppointmentRemoteDataSource extends Mock
    implements AppointmentRemoteDataSource {}

void main() {
  late MockAppointmentRemoteDataSource mockDataSource;
  late AppointmentRepositoryImpl repository;

  setUp(() {
    mockDataSource = MockAppointmentRemoteDataSource();
    repository = AppointmentRepositoryImpl(mockDataSource);
  });

  group('AppointmentRepositoryImpl', () {
    test('getMyAppointments returns list of entities', () async {
      final mockModels = [
        AppointmentModel(
          id: '1',
          appointmentTime: DateTime.now(),
          status: 'booked',
          clinicId: 'clinic-1',
          doctor: _mockDoctor(),
          duration: const Duration(minutes: 30),
        ),
      ];

      when(() => mockDataSource.getMyAppointments())
          .thenAnswer((_) async => mockModels);

      final result = await repository.getMyAppointments();

      expect(result, isNotEmpty);
      expect(result.first.id, '1');
      verify(() => mockDataSource.getMyAppointments()).called(1);
    });
  });
}

DoctorModel _mockDoctor() {
  return DoctorModel(
    id: '1',
    specialization: 'GP',
    consultationDuration: 30,
    user: DoctorUserModel(
      id: '1',
      name: 'Dr. John',
    ),
  );
}
