// lib/features/home/presentation/screens/home_shell_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../appointments/presentation/screens/appointments_list_screen.dart';
import '../../../profile/presentation/screens/profile_screen.dart';
import '../../../queue/presentation/screens/queue_status_screen.dart';

final homeTabProvider = StateProvider<int>((ref) => 0);

class HomeShellScreen extends ConsumerWidget {
  const HomeShellScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentTab = ref.watch(homeTabProvider);

    return Scaffold(
      body: IndexedStack(
        index: currentTab,
        children: [
          _buildTab('Appointments', const AppointmentsListScreen()),
          _buildTab('Queue', const QueueStatusScreen()),
          _buildTab('Profile', const ProfileScreen()),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentTab,
        onTap: (index) => ref.read(homeTabProvider.notifier).state = index,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Appointments',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.queue),
            label: 'Queue',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String title, Widget child) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        centerTitle: true,
      ),
      body: child,
    );
  }
}
