// lib/features/appointments/presentation/screens/appointments_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../notifiers/appointment_notifier.dart';
import '../providers/appointment_providers.dart';
import '../widgets/appointment_card.dart';
import '../widgets/appointment_empty_state.dart';
import 'appointment_details_screen.dart';

class AppointmentsListScreen extends ConsumerStatefulWidget {
  const AppointmentsListScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AppointmentsListScreen> createState() =>
      _AppointmentsListScreenState();
}

class _AppointmentsListScreenState extends ConsumerState<AppointmentsListScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(myAppointmentsProvider.notifier).fetchAppointments();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(myAppointmentsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(myAppointmentsProvider.notifier).fetchAppointments();
      },
      child: _buildContent(state),
    );
  }

  Widget _buildContent(AppointmentState state) {
    return switch (state) {
      AppointmentLoading() => const Center(
          child: CircularProgressIndicator(),
        ),
      AppointmentEmpty() => const AppointmentEmptyState(),
      AppointmentLoaded(:final appointments) => ListView.builder(
          itemCount: appointments.length,
          itemBuilder: (context, index) {
            final appointment = appointments[index];
            return AppointmentCard(
              appointment: appointment,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => AppointmentDetailsScreen(
                      appointment: appointment,
                    ),
                  ),
                );
              },
            );
          },
        ),
      AppointmentError(:final message) => _buildErrorState(message),
    };
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              ref.read(myAppointmentsProvider.notifier).retry();
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}
