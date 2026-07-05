// lib/features/queue/data/repositories/queue_repository_impl.dart
import '../../domain/entities/queue_position_entity.dart';
import '../../domain/repositories/queue_repository.dart';
import '../datasources/queue_remote_datasource.dart';

class QueueRepositoryImpl implements QueueRepository {
  final QueueRemoteDataSource _remoteDataSource;

  QueueRepositoryImpl(this._remoteDataSource);

  @override
  Future<QueuePositionEntity?> getMyQueuePosition() async {
    final model = await _remoteDataSource.getMyQueuePosition();
    return model?.toEntity();
  }
}
