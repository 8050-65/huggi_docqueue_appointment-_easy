// lib/features/queue/domain/usecases/get_my_queue_position_usecase.dart
import '../entities/queue_position_entity.dart';
import '../repositories/queue_repository.dart';

class GetMyQueuePositionUseCase {
  final QueueRepository _repository;

  GetMyQueuePositionUseCase(this._repository);

  Future<QueuePositionEntity?> call() async {
    return _repository.getMyQueuePosition();
  }
}
