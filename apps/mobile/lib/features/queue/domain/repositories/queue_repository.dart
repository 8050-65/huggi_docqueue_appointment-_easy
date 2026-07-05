// lib/features/queue/domain/repositories/queue_repository.dart
import '../entities/queue_position_entity.dart';

abstract class QueueRepository {
  /// Fetch current queue position
  /// Returns null if patient is not in queue
  /// Throws [ApiException] on error
  Future<QueuePositionEntity?> getMyQueuePosition();
}
