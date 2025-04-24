import 'package:flutter/material.dart';
import 'package:foodloop_mobile/features/auth/pages/login_screen.dart';
import 'package:foodloop_mobile/features/auth/pages/sign_up.dart';
import 'package:foodloop_mobile/features/auth/services/auth_service.dart';
import 'package:foodloop_mobile/features/donations/pages/donationscreen.dart';
import 'package:foodloop_mobile/features/donations/pages/joyloopscreen.dart';
import 'package:foodloop_mobile/features/donations/screens/available_donations_screen.dart';
import 'package:foodloop_mobile/features/home/pages/dashboard.dart';
import 'package:foodloop_mobile/features/maps/FoodMapScreen.dart';

import 'package:flutter/services.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:foodloop_mobile/features/maps/demo_map.dart';

void initApp() {
  // Ensure Flutter is initialized
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  
  // Keep the splash screen visible while initializing
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  
  // Set preferred orientations
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Remove the splash screen when initialization is complete
  FlutterNativeSplash.remove();
}
Future<void> main() async {
  // await dotenv.load(); // Load .env before app starts
  runApp(FoodLoopApp());
}

class FoodLoopApp extends StatelessWidget {
  final _authService = AuthService();

  FoodLoopApp({super.key});
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'FoodLoop',
      theme: ThemeData(
        primarySwatch: Colors.orange,
        fontFamily: 'Merriweather',
        scaffoldBackgroundColor: Colors.grey[50],
      ),
      initialRoute: '/init',
      routes: {
        '/init': (context) => FutureBuilder<bool>(
          future: _authService.isLoggedIn(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }
            
            final isLoggedIn = snapshot.data ?? false;
            if (isLoggedIn) {
              return DashboardScreen();
            } else {
              return LoginScreen();
            }
          },
        ),
        '/login': (context) => LoginScreen(),
        '/signup': (context) => SignupScreen(),
        '/available-donation': (context) => AvailableDonationsScreen(),
        '/donate': (context) => DonateScreen(),
        '/joyloops': (context) => JoyLoopsScreen(),
         '/map': (context) => FoodMapScreen(),
         '/dashboard': (context) => DashboardScreen(),
         '/demo-map': (context) => GoogleMapDemo(),

      },
    );
  }
}
