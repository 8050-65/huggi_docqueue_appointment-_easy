// test/features/appointments/presentation/notifiers/appointment_notifier_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:huggi_patient_app/core/network/api_exception.dart';
import 'package:huggi_patient_app/features/appointments/domain/entities/appointment_entity.dart';
import 'package:huggi_patient_app/features/appointments/domain/usecases/get_my_appointments_usecase.dart';
import 'package:huggi_patient_app/features/appointments/presentation/notifiers/appointment_notifier.dart';
import 'package:mocktail/mocktail.dart';

class MockGetMyAppointmentsUseCase extends Mock
    implements GetMyAppointmentsUseCase {}

void main() {
  late MockGetMyAppointmentsUseCase mockUseCase;
  late AppointmentNotifier notifier;

  setUp(() {
    mockUseCase = MockGetMyAppointmentsUseCase();
    notifier = AppointmentNotifier(mockUseCase);
  });

  group('AppointmentNotifier', () {
    test('initial state is loading', () {
      expect(notifier.state, isA<AppointmentLoading>());
    });

    test('fetchAppointments sets loaded state on success', () async {
      final appointments = [
        AppointmentEntity(
          id: '1',
          doctorId: 'd-1',
          doctorName: 'Dr. John',
          clinicId: 'c-1',
          appointmentTime: DateTime.now(),
          duration: const Duration(minutes: 30),
          status: 'booked',
        ),
      ];

      when(() => mockUseCase.call()).thenAnswer((_) async => appointments);

      await notifier.fetchAppointments();

      expect(notifier.state, isA<AppointmentLoaded>());
      expect((notifier.state as AppointmentLoaded).appointments, appointments);
    });

    test('fetchAppointments sets empty state when no appointments', () async {
      when(() => mockUseCase.call()).thenAnswer((_) async => []);

      await notifier.fetchAppointments();

      expect(notifier.state, isA<AppointmentEmpty>());
    });

    test('fetchAppointments sets error state on exception', () async {
      when(() => mockUseCase.call())
          .thenThrow(ApiException(message: 'Network error'));

      await notifier.fetchAppointments();

      expect(notifier.state, isA<AppointmentError>());
      expect((notifier.state as AppointmentError).message, 'Network error');
    });
  });
}
