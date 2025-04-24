import 'dart:convert';
import 'package:foodloop_mobile/core/constants/api_constants.dart';
import 'package:foodloop_mobile/features/auth/services/auth_service.dart';
import 'package:http/http.dart' as http;

class DonationService {
  final AuthService _authService = AuthService();
  
  Future<Map<String, dynamic>> createDonation(Map<String, dynamic> donationData) async {
    final token = await _authService.getAuthToken();
    if (token == null) {
      throw Exception('Authentication required');
    }
    
    // Get current user id
    final user = await _authService.getUserProfile();
    if (user == null) {
      throw Exception('User information not available');
    }
    
    // Add donor field to donation data
    donationData['donor'] = user['_id'];
    
    final response = await http.post(
      Uri.parse(ApiConstants.createDonation),
      headers: {
        'Authorization': 'Bearer $token',
        "Content-Type": "application/json"
      },
      body: jsonEncode(donationData),
    );
    print('Response status: ${response}');
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create donation: ${response.body}');
    }
  }
  
  Future<List<dynamic>> getAvailableDonations() async {
    final response = await http.get(Uri.parse(ApiConstants.listDonations));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load donations');
    }
  }
  
  Future<List<dynamic>> getUserDonations() async {
    final token = await _authService.getAuthToken();
    if (token == null) {
      throw Exception('Authentication required');
    }
    
    final response = await http.get(
      Uri.parse(ApiConstants.myDonations),
      headers: {'Authorization': 'Bearer $token'},
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load user donations');
    }
  }
}