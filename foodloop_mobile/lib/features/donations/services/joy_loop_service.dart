import 'dart:convert';
import 'package:foodloop_mobile/features/auth/services/auth_service.dart';
import 'package:http/http.dart' as http;
import 'dart:io';

class JoyLoopService {
  static const String baseUrl = 'http://10.0.2.2:5000/api/joy';
  final AuthService _authService = AuthService();
  
  Future<List<dynamic>> getJoyMoments() async {
    final response = await http.get(Uri.parse('$baseUrl/joy-moments'));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load joy moments');
    }
  }
  
  Future<List<dynamic>> getTopDonors() async {
    final response = await http.get(Uri.parse('$baseUrl/top-donors'));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load top donors');
    }
  }
  
  Future<List<dynamic>> getJoySpreaders() async {
    final response = await http.get(Uri.parse('$baseUrl/joy-spreaders'));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load joy spreaders');
    }
  }
  
  Future<Map<String, dynamic>> postJoyMoment(String content, File? mediaFile) async {
    final token = await _authService.getAuthToken();
    if (token == null) {
      throw Exception('Authentication required');
    }
    
    var request = http.MultipartRequest(
      'POST',
      Uri.parse('http://10.0.2.2:5000/api/joyloop')
    );
    
    request.headers['Authorization'] = 'Bearer $token';
    request.fields['content'] = content;
    
    if (mediaFile != null) {
      request.files.add(await http.MultipartFile.fromPath(
        'media',
        mediaFile.path,
      ));
    }
    
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to post joy moment: ${response.body}');
    }
  }
}