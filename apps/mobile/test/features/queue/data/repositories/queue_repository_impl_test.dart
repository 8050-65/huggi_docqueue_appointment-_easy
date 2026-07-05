// test/features/queue/data/repositories/queue_repository_impl_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:huggi_patient_app/features/appointments/data/models/appointment_model.dart';
import 'package:huggi_patient_app/features/queue/data/datasources/queue_remote_datasource.dart';
import 'package:huggi_patient_app/features/queue/data/models/queue_position_model.dart';
import 'package:huggi_patient_app/features/queue/data/repositories/queue_repository_impl.dart';
import 'package:mocktail/mocktail.dart';

class MockQueueRemoteDataSource extends Mock
    implements QueueRemoteDataSource {}

void main() {
  late MockQueueRemoteDataSource mockDataSource;
  late QueueRepositoryImpl repository;

  setUp(() {
    mockDataSource = MockQueueRemoteDataSource();
    repository = QueueRepositoryImpl(mockDataSource);
  });

  group('QueueRepositoryImpl', () {
    test('getMyQueuePosition returns entity when position exists', () async {
      final mockModel = QueuePositionModel(
        queueId: 'queue-1',
        position: 5,
        status: 'waiting',
        appointment: QueueAppointmentSnapshotModel(
          id: 'apt-1',
          appointmentTime: DateTime.now(),
          doctor: _mockDoctor(),
        ),
      );

      when(() => mockDataSource.getMyQueuePosition())
          .thenAnswer((_) async => mockModel);

      final result = await repository.getMyQueuePosition();

      expect(result, isNotNull);
      expect(result?.positionNumber, 5);
      verify(() => mockDataSource.getMyQueuePosition()).called(1);
    });

    test('getMyQueuePosition returns null when not in queue', () async {
      when(() => mockDataSource.getMyQueuePosition())
          .thenAnswer((_) async => null);

      final result = await repository.getMyQueuePosition();

      expect(result, isNull);
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
