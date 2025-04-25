import 'dart:convert';
import 'dart:developer';
import 'dart:io';
import 'package:foodloop_mobile/core/constants/api_constants.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:foodloop_mobile/features/auth/services/auth_service.dart';

class DonationService {
  final AuthService _authService = AuthService();

  Future<Map<String, dynamic>> createDonation(
    Map<String, dynamic> donationData,
    List<File> images,
  ) async {
    try {
      final token = await _authService.getAuthToken();

      if (token == null) {
        throw Exception('Authentication token not found');
      }

      final uri = Uri.parse(ApiConstants.createDonation);
      final request = http.MultipartRequest('POST', uri);

      // Add headers
      request.headers.addAll({'Authorization': 'Bearer $token'});

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
    try {
      final token = await _authService.getAuthToken();

      if (token == null) {
        throw Exception('Authentication token not found');
      }

      final response = await http.get(
        Uri.parse(ApiConstants.listDonations),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);

        // Log response structure for debugging
        log('Response structure: ${data.keys}');

        // Handle the actual response format from backend
        if (data.containsKey('success') && data.containsKey('data')) {
          return data['data'] as List<dynamic>;
        } else if (data.containsKey('donations')) {
          return data['donations'] as List<dynamic>;
        } else if (data is Map &&
            data.values.isNotEmpty &&
            data.values.first is List) {
          // Fallback to first list value found
          return data.values.first as List<dynamic>;
        } else {
          log('Unexpected response format: $data');
          throw Exception('Unexpected response format');
        }
      } else {
        throw Exception('Failed to load donations: ${response.statusCode}');
      }
    } catch (e) {
      log('Error in getAvailableDonations: $e');
      throw Exception('Failed to load donations: $e');
    }
  }

  Future<Map<String, dynamic>> claimDonation(String donationId) async {
    try {
      final token = await _authService.getAuthToken();

      if (token == null) {
        throw Exception('Authentication token not found');
      }

      final response = await http.post(
        Uri.parse('${ApiConstants.donationBaseUrl}/claim/$donationId'),
        headers: {  
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        log(
          'Error claiming donation: ${response.statusCode}, ${response.body}',
        );
        throw Exception('Failed to claim donation: ${response.reasonPhrase}');
      }
    } catch (e) {
      log('Error in claimDonation: $e');
      throw Exception('Failed to claim donation: $e');
    }
  }
}
