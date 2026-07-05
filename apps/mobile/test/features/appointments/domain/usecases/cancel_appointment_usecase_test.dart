// test/features/appointments/domain/usecases/cancel_appointment_usecase_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:huggi_patient_app/features/appointments/domain/repositories/appointment_repository.dart';
import 'package:huggi_patient_app/features/appointments/domain/usecases/cancel_appointment_usecase.dart';
import 'package:mocktail/mocktail.dart';

class MockAppointmentRepository extends Mock implements AppointmentRepository {}

void main() {
  late MockAppointmentRepository mockRepository;
  late CancelAppointmentUseCase useCase;

  setUp(() {
    mockRepository = MockAppointmentRepository();
    useCase = CancelAppointmentUseCase(mockRepository);
  });

  group('CancelAppointmentUseCase', () {
    test('calls repository.cancelAppointment with correct appointment ID', () async {
      const appointmentId = 'apt-123';

      when(() => mockRepository.cancelAppointment(appointmentId))
          .thenAnswer((_) async {});

      await useCase.call(appointmentId);

      verify(() => mockRepository.cancelAppointment(appointmentId)).called(1);
    });

    test('throws exception when repository throws', () async {
      const appointmentId = 'apt-123';
      final exception = Exception('Cancel failed');

      when(() => mockRepository.cancelAppointment(appointmentId))
          .thenThrow(exception);

      expect(
        () => useCase.call(appointmentId),
        throwsException,
      );
    });
  });
}
