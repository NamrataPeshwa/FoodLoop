import 'dart:convert';
import 'package:http/http.dart' as http;

class ImpactService {
  static const String baseUrl = 'http://10.0.2.2:5000/api/impact';
  
  Future<Map<String, dynamic>> getImpactStats() async {
    final response = await http.get(Uri.parse('$baseUrl/impact'));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load impact statistics');
    }
  }
}