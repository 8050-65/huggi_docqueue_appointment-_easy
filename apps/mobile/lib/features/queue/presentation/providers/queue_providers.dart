// lib/features/queue/presentation/providers/queue_providers.dart
import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/network_provider.dart';
import '../../data/datasources/queue_remote_datasource.dart';
import '../../data/repositories/queue_repository_impl.dart';
import '../../domain/usecases/get_my_queue_position_usecase.dart';
import '../notifiers/queue_notifier.dart';

final queueRemoteDataSourceProvider = Provider((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return QueueRemoteDataSource(dioClient);
});

final queueRepositoryProvider = Provider((ref) {
  final dataSource = ref.watch(queueRemoteDataSourceProvider);
  return QueueRepositoryImpl(dataSource);
});

final getMyQueuePositionUseCaseProvider = Provider((ref) {
  final repository = ref.watch(queueRepositoryProvider);
  return GetMyQueuePositionUseCase(repository);
});

final myQueuePositionProvider =
    StreamProvider.autoDispose<QueueState>((ref) async* {
  final useCase = ref.watch(getMyQueuePositionUseCaseProvider);

  int backoffMultiplier = 1;

  while (true) {
    try {
      final position = await useCase.call();
      if (position == null) {
        yield const QueueNotInQueue();
      } else {
        yield QueueLoaded(position);
      }
      backoffMultiplier = 1;
    } catch (e) {
      yield QueueError(e.toString());
    }

    final backoffDuration = (5 * backoffMultiplier).clamp(5, 30);
    if (backoffMultiplier < 6) backoffMultiplier++;

    await Future.delayed(Duration(seconds: backoffDuration));
  }
});
