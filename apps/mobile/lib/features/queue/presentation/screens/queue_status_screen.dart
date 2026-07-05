// lib/features/queue/presentation/screens/queue_status_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../notifiers/queue_notifier.dart';
import '../providers/queue_providers.dart';
import '../widgets/queue_position_card.dart';

class QueueStatusScreen extends ConsumerWidget {
  const QueueStatusScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final queueState = ref.watch(myQueuePositionProvider);

    return queueState.when(
      data: (state) => _buildContent(context, state),
      loading: () => const Center(
        child: CircularProgressIndicator(),
      ),
      error: (error, stack) => Center(
        child: Text('Error: $error'),
      ),
    );
  }

  Widget _buildContent(BuildContext context, QueueState state) {
    return switch (state) {
      QueueLoading() => const Center(
          child: CircularProgressIndicator(),
        ),
      QueueLoaded(:final position) => QueuePositionCard(position: position),
      QueueNotInQueue() => _buildNotInQueueState(context),
      QueueError(:final message) => _buildErrorState(context, message),
    };
  }

  Widget _buildNotInQueueState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.check_circle,
            size: 64,
            color: Colors.green[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Not in queue',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'You have no upcoming queue position',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.red[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Error',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
