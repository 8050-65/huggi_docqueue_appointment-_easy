// test/features/queue/presentation/notifiers/queue_notifier_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:huggi_patient_app/core/network/api_exception.dart';
import 'package:huggi_patient_app/features/queue/domain/entities/queue_position_entity.dart';
import 'package:huggi_patient_app/features/queue/domain/usecases/get_my_queue_position_usecase.dart';
import 'package:huggi_patient_app/features/queue/presentation/notifiers/queue_notifier.dart';
import 'package:mocktail/mocktail.dart';

class MockGetMyQueuePositionUseCase extends Mock
    implements GetMyQueuePositionUseCase {}

void main() {
  late MockGetMyQueuePositionUseCase mockUseCase;
  late QueueNotifier notifier;

  setUp(() {
    mockUseCase = MockGetMyQueuePositionUseCase();
    notifier = QueueNotifier(mockUseCase);
  });

  group('QueueNotifier', () {
    test('initial state is loading', () {
      expect(notifier.state, isA<QueueLoading>());
    });

    test('fetchQueuePosition sets loaded state on success', () async {
      final position = QueuePositionEntity(
        patientId: 'p-1',
        queueId: 'q-1',
        positionNumber: 5,
        doctorName: 'Dr. John',
        tokenTime: DateTime.now(),
        status: 'waiting',
      );

      when(() => mockUseCase.call()).thenAnswer((_) async => position);

      await notifier.fetchQueuePosition();

      expect(notifier.state, isA<QueueLoaded>());
      expect((notifier.state as QueueLoaded).position, position);
    });

    test('fetchQueuePosition sets not in queue state when null', () async {
      when(() => mockUseCase.call()).thenAnswer((_) async => null);

      await notifier.fetchQueuePosition();

      expect(notifier.state, isA<QueueNotInQueue>());
    });

    test('fetchQueuePosition sets error state on exception', () async {
      when(() => mockUseCase.call())
          .thenThrow(ApiException(message: 'Network error'));

      await notifier.fetchQueuePosition();

      expect(notifier.state, isA<QueueError>());
    });

    test('backoff duration increases on each call', () {
      expect(notifier.getBackoffDuration(), 5);
      expect(notifier.getBackoffDuration(), 10);
      expect(notifier.getBackoffDuration(), 15);
      expect(notifier.getBackoffDuration(), 20);
      expect(notifier.getBackoffDuration(), 25);
      expect(notifier.getBackoffDuration(), 30);
      expect(notifier.getBackoffDuration(), 30); // Max 30
    });

    test('resetBackoff resets multiplier', () {
      notifier.getBackoffDuration();
      notifier.getBackoffDuration();
      notifier.resetBackoff();
      expect(notifier.getBackoffDuration(), 5);
    });
  });
}
