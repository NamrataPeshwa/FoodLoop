import 'package:flutter/material.dart';
import 'package:foodloop_mobile/core/theme/theme.dart';
import 'package:foodloop_mobile/core/utils/splash_screent.dart';
import 'package:foodloop_mobile/features/auth/pages/login_screen.dart';
import 'package:foodloop_mobile/features/auth/pages/sign_up.dart';
import 'package:foodloop_mobile/features/home/pages/home.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightThemeMode,
      initialRoute: '/',
    routes: {
        '/': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/signup': (context) => const SignupScreen(),
        '/home': (context) => const Home(),
      },
    );
  }
}
