import 'dart:convert';
import 'dart:developer';
import 'dart:io';
import 'package:foodloop_mobile/core/constants/api_constants.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:foodloop_mobile/features/auth/services/auth_service.dart';

class DonationService {
  final AuthService _authService = AuthService();

  Future<Map<String, dynamic>> createDonation(Map<String, dynamic> donationData, List<File> images) async {
    try {
      final token = await _authService.getAuthToken();
      
      if (token == null) {
        throw Exception('Authentication token not found');
      }

      final uri = Uri.parse(ApiConstants.createDonation);
      final request = http.MultipartRequest('POST', uri);
      
      // Add headers
      request.headers.addAll({
        'Authorization': 'Bearer $token',
      });
      
      // Add donation data fields
      donationData.forEach((key, value) {
        request.fields[key] = value.toString();
      });
      
      // Log request for debugging
      log('Creating donation at URL: $uri');
      log('Headers: ${request.headers}');
      log('Fields: ${request.fields}');

      // Add image files
      for (var i = 0; i < images.length; i++) {
        final file = images[i];
        final fileBytes = await file.readAsBytes();
        final fileExtension = file.path.split('.').last.toLowerCase();
        
        final multipartFile = http.MultipartFile.fromBytes(
          'images', // Field name that server expects
          fileBytes,
          filename: 'image_$i.$fileExtension',
          contentType: MediaType('image', fileExtension),
        );
        
        request.files.add(multipartFile);
      }
      
      log('Files count: ${request.files.length}');

      // Send the request
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      
      log('Response status: ${response.statusCode}');
      log('Response body: ${response.body}');
      
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Failed to create donation: ${response.body}');
      }
      
      return json.decode(response.body);
    } catch (e) {
      log('Error in createDonation: $e');
      throw Exception('Failed to create donation: $e');
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
}