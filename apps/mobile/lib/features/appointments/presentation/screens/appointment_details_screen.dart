// lib/features/appointments/presentation/screens/appointment_details_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../domain/entities/appointment_entity.dart';
import '../notifiers/appointment_details_notifier.dart';
import '../providers/appointment_providers.dart';

class AppointmentDetailsScreen extends ConsumerWidget {
  final AppointmentEntity appointment;

  const AppointmentDetailsScreen({
    super.key,
    required this.appointment,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(appointmentDetailsProvider(appointment));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Appointment Details'),
        centerTitle: true,
      ),
      body: _buildContent(context, ref, state),
    );
  }

  Widget _buildContent(
    BuildContext context,
    WidgetRef ref,
    AppointmentDetailsState state,
  ) {
    return switch (state) {
      AppointmentDetailsLoaded(:final appointment) =>
        _buildDetails(context, ref, appointment),
      AppointmentDetailsCancelling(:final appointment) =>
        _buildCancelling(context, appointment),
      AppointmentDetailsCancelled() => _buildCancelled(context),
      AppointmentDetailsRescheduling(:final appointment) =>
        _buildRescheduling(context, appointment),
      AppointmentDetailsError(:final message, :final appointment) =>
        _buildError(context, message, appointment),
      _ => const Center(child: CircularProgressIndicator()),
    };
  }

  Widget _buildDetails(
    BuildContext context,
    WidgetRef ref,
    AppointmentEntity appointment,
  ) {
    final notifier = ref.read(appointmentDetailsProvider(appointment).notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    appointment.doctorName,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow(
                    'Date & Time',
                    DateFormat('EEEE, MMM d, yyyy – h:mm a')
                        .format(appointment.appointmentTime.toLocal()),
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow(
                    'Duration',
                    '${appointment.duration.inMinutes} minutes',
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow(
                    'Status',
                    appointment.status.replaceAll('_', ' ').toUpperCase(),
                  ),
                  if (appointment.notes != null) ...[
                    const SizedBox(height: 12),
                    _buildDetailRow('Notes', appointment.notes!),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          if (notifier.canCancel)
            ElevatedButton.icon(
              onPressed: () => _showCancelDialog(context, ref, appointment),
              icon: const Icon(Icons.close),
              label: const Text('Cancel Appointment'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
              ),
            ),
          if (notifier.canReschedule) ...[
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () => _showRescheduleDialog(context, ref, appointment),
              icon: const Icon(Icons.edit),
              label: const Text('Reschedule'),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.w500,
              color: Colors.grey,
            ),
          ),
        ),
        Expanded(
          child: Text(value),
        ),
      ],
    );
  }

  Widget _buildCancelling(BuildContext context, AppointmentEntity appointment) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          const Text('Cancelling appointment...'),
        ],
      ),
    );
  }

  Widget _buildCancelled(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.check_circle, size: 64, color: Colors.green[400]),
          const SizedBox(height: 16),
          const Text('Appointment cancelled'),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  Widget _buildRescheduling(
      BuildContext context, AppointmentEntity appointment) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          const Text('Rescheduling appointment...'),
        ],
      ),
    );
  }

  Widget _buildError(
    BuildContext context,
    String message,
    AppointmentEntity? appointment,
  ) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
          const SizedBox(height: 16),
          Text(message),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Go Back'),
          ),
        ],
      ),
    );
  }

  void _showCancelDialog(
    BuildContext context,
    WidgetRef ref,
    AppointmentEntity appointment,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Appointment'),
        content: const Text(
          'Are you sure you want to cancel this appointment? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Keep'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Trigger cancellation (with WhatsApp/Email notifications)
              ref.read(appointmentDetailsProvider(appointment).notifier).cancelAppointment();
            },
            child: const Text('Cancel', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showRescheduleDialog(
    BuildContext context,
    WidgetRef ref,
    AppointmentEntity appointment,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reschedule Appointment'),
        content: const Text('Reschedule feature coming soon'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
