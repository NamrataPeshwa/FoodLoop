import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl = 'http://10.0.2.2:5000/api/auth';
  
  Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
      print(response.body);
      // if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Store the token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('authToken', data['token']);
        return true;
      // }
      // return false;
    } catch (e) {
      
      print('Login error: $e');
      return false;
    }
  }
  
  Future<bool> signup(Map<String, dynamic> userData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(userData),
      );
      print(response.body);
      return response.statusCode == 200;
    } catch (e) {
      print('Signup error: $e');
      return false;
    }
  }
  
  Future<String?> getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('authToken');
  }
  
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('authToken');
  }
  
  Future<bool> isLoggedIn() async {
    final token = await getAuthToken();
    return token != null;
  }
  
  Future<Map<String, dynamic>> getUserProfile() async {
    final token = await getAuthToken();
    final response = await http.get(
      Uri.parse('http://10.0.2.2:5000/api/user/profile'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return {};
  }
}
