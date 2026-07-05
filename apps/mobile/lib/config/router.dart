// lib/config/router.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/appointments/presentation/screens/appointments_list_screen.dart';
import '../features/auth/domain/entities/auth_state.dart';
import '../features/auth/presentation/providers/auth_providers.dart';
import '../features/auth/presentation/screens/otp_verification_screen.dart';
import '../features/auth/presentation/screens/phone_input_screen.dart';
import '../features/auth/presentation/screens/splash_screen.dart';
import '../features/home/presentation/screens/home_shell_screen.dart';
import '../features/profile/presentation/screens/profile_screen.dart';
import '../features/queue/presentation/screens/queue_status_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const PhoneInputScreen(),
        routes: [
          GoRoute(
            path: 'otp',
            builder: (context, state) {
              final phoneNumber = state.extra as String?;
              return OtpVerificationScreen(
                phoneNumber: phoneNumber ?? '0000000000',
              );
            },
          ),
        ],
        redirect: (context, state) async {
          final authState = ref.read(authNotifierProvider);
          if (authState is AuthAuthenticated) {
            return '/home';
          }
          return null;
        },
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeShellScreen(),
        redirect: (context, state) async {
          final authState = ref.read(authNotifierProvider);
          if (authState is! AuthAuthenticated) {
            return '/login';
          }
          return null;
        },
      ),
    ],
  );
});
