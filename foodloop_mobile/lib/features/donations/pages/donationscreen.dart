import 'package:flutter/material.dart';
import 'package:foodloop_mobile/features/auth/services/auth_service.dart';
import '../services/donation_service.dart';
import 'package:intl/intl.dart';

class DonateScreen extends StatefulWidget {
  @override
  _DonateScreenState createState() => _DonateScreenState();
}

class _DonateScreenState extends State<DonateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _donationService = DonationService();
  final authService = AuthService();
  bool _isSubmitting = false;
  late String token;
  late String userId;
  String _foodDescription = '';
  double _hoursOld = 1.0;
  String _storage = 'room temp';
  String _weight = '';
  DateTime _expirationDate = DateTime.now().add(Duration(days: 1));
  List<double> _location = [0, 0]; // [lng, lat]

  Future<void> _submitDonation() async {
    if (!_formKey.currentState!.validate()) return;

    _formKey.currentState!.save();

    setState(() => _isSubmitting = true);

    try {
      _loadUserData();
      final result = await _donationService.createDonation({
        // 'donor': userId,
        'foodDescription': _foodDescription,
        'hoursOld': _hoursOld,
        'storage': _storage,
        'weight': _weight,
        'expirationDate': _expirationDate.toIso8601String(),
        'location': {'type': 'Point', 'coordinates': _location},
      });
      print('Donation created: $result');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Donation created successfully!')));

      // Clear the form or navigate back
      Navigator.pop(context);
    } catch (e) {
      print('Error creating donation: $e');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error creating donation: $e')));
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    token = (await authService.getAuthToken())!;
    userId = (await authService.getUserId())!;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Donate Food'),
        backgroundColor: Colors.orange,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(16.0),
          children: [
            TextFormField(
              decoration: InputDecoration(
                labelText: 'Food Description',
                hintText: 'E.g., Fresh sandwiches, pasta, etc.',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter a food description';
                }
                return null;
              },
              onSaved: (value) => _foodDescription = value!,
            ),
            SizedBox(height: 16),
            Text('How old is the food? (hours)'),
            Slider(
              value: _hoursOld,
              min: 0,
              max: 24,
              divisions: 24,
              label: _hoursOld.round().toString(),
              onChanged: (value) {
                setState(() => _hoursOld = value);
              },
            ),
            SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: InputDecoration(
                labelText: 'Storage Condition',
                border: OutlineInputBorder(),
              ),
              value: _storage,
              items:
                  ['room temp', 'refrigerated', 'frozen'].map((String value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Text(value.toUpperCase()),
                    );
                  }).toList(),
              onChanged: (value) {
                setState(() => _storage = value!);
              },
            ),
            SizedBox(height: 16),
            TextFormField(
              decoration: InputDecoration(
                labelText: 'Weight (kg)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter the weight';
                }
                return null;
              },
              onSaved: (value) => _weight = value!,
            ),
            SizedBox(height: 16),
            ListTile(
              title: Text('Expiration Date'),
              subtitle: Text(DateFormat('yyyy-MM-dd').format(_expirationDate)),
              trailing: Icon(Icons.calendar_today),
              onTap: () async {
                final DateTime? picked = await showDatePicker(
                  context: context,
                  initialDate: _expirationDate,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(Duration(days: 30)),
                );
                if (picked != null) {
                  setState(() => _expirationDate = picked);
                }
              },
            ),
            SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitDonation,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                padding: EdgeInsets.symmetric(vertical: 16),
              ),
              child:
                  _isSubmitting
                      ? CircularProgressIndicator(color: Colors.white)
                      : Text('DONATE NOW'),
            ),
          ],
        ),
      ),
    );
  }
}
