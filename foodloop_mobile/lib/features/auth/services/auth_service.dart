import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl = 'http://10.0.2.2:5000/api/auth'; // Update IP

  static Future<Map<String, dynamic>> login(String email, String password) async {
  final response = await http.post(
    Uri.parse('$baseUrl/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email, 'password': password}),
  );

  final data = jsonDecode(response.body);

  if (data['token'] != null) {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', data['token']);
  }

  return data;
}

  static Future<Map<String, dynamic>> signup(
      String name, String email, String password, String role) async {
    final response = await http.post(
      Uri.parse('$baseUrl/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      }),
    );

    return jsonDecode(response.body);
  }
}
