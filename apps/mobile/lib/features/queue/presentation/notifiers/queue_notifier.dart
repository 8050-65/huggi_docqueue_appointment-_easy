// lib/features/queue/presentation/notifiers/queue_notifier.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_exception.dart';
import '../../domain/entities/queue_position_entity.dart';
import '../../domain/usecases/get_my_queue_position_usecase.dart';

sealed class QueueState {
  const QueueState();
}

class QueueLoading extends QueueState {
  const QueueLoading();
}

class QueueLoaded extends QueueState {
  final QueuePositionEntity position;
  const QueueLoaded(this.position);
}

class QueueError extends QueueState {
  final String message;
  const QueueError(this.message);
}

class QueueNotInQueue extends QueueState {
  const QueueNotInQueue();
}

class QueueNotifier extends StateNotifier<QueueState> {
  final GetMyQueuePositionUseCase _useCase;
  int _backoffMultiplier = 1;

  QueueNotifier(this._useCase) : super(const QueueLoading());

  Future<void> fetchQueuePosition() async {
    state = const QueueLoading();
    try {
      final position = await _useCase.call();
      if (position == null) {
        state = const QueueNotInQueue();
      } else {
        state = QueueLoaded(position);
      }
      _backoffMultiplier = 1;
    } on ApiException catch (e) {
      state = QueueError(e.message);
    } catch (e) {
      state = const QueueError('Failed to load queue position');
    }
  }

  int getBackoffDuration() {
    final baseDuration = 5;
    final duration = baseDuration * _backoffMultiplier;
    if (_backoffMultiplier < 6) _backoffMultiplier++;
    return duration;
  }

  void resetBackoff() {
    _backoffMultiplier = 1;
  }

  Future<void> retry() => fetchQueuePosition();
}
