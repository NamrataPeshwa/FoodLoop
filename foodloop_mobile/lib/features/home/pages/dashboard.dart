import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:foodloop_mobile/features/auth/services/auth_service.dart';
import 'package:foodloop_mobile/features/donations/services/impact_statistics.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _authService = AuthService();
  final _impactService = ImpactService();
  Map<String, dynamic> _userProfile = {};
  Map<String, dynamic> _impactStats = {};
  bool _isLoading = true;
  int _selectedIndex = 0; // For bottom navigation

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    try {
      final userProfile = await _authService.getUserProfile();
      final impactStats = await _impactService.getImpactStats();

      log('User profile loaded: $userProfile'); // Debug output
      
      setState(() {
        _userProfile = userProfile;
        _impactStats = impactStats;
        log('Impact stats loaded: $_impactStats'); // Add debug output for impact stats
        log('Updated user profile: $_userProfile'); // Add debug to verify state update
      });
      
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error loading data: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }


  // Handle navigation when a bottom navigation item is tapped
  void _onItemTapped(int index) {
    if (index == _selectedIndex)
      return; // No need to navigate if already on this page

    switch (index) {
      case 0: // Dashboard
        setState(() {
          _selectedIndex = 0;
        });
        break;
      case 1: // Donate Food
         if (_userProfile['role'] == 'donor'){
        Navigator.pushNamed(context, '/donate');
         }else{
          Navigator.pushNamed(context, '/available-donation');
         }
        break;
      case 2: // Food Map
        Navigator.pushNamed(context, '/map');
        break;
      case 3: // Joy Loops
        Navigator.pushNamed(context, '/joyloops');
        break;
      case 4: // Profile/More
        _showProfileMenu();
        break;
    }
  }

  // Show modal bottom sheet for profile/more options
  void _showProfileMenu() async{
    _userProfile = await _authService.getUserProfile();
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return Wrap(
          children: <Widget>[
            ListTile(
              leading: CircleAvatar(
                backgroundColor: Colors.orange,
                child: Text(
                  _userProfile['name']?.substring(0, 1) ?? 'U',
                  style: TextStyle(color: Colors.white),
                ),
              ),
              title: Text(_userProfile['name'] ?? 'User'),
              subtitle: Text(_userProfile['email'] ?? ''),
            ),
            Divider(),
            if (_userProfile['role'] == 'NGO')
              ListTile(
                leading: Icon(Icons.settings),
                title: Text('Preferences'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/ngo-preferences');
                },
              ),
            ListTile(
              leading: Icon(Icons.logout),
              title: Text('Logout'),
              onTap: () async {
                Navigator.pop(context);
                await _authService.logout();
                Navigator.pushReplacementNamed(context, '/login');
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Center(
          child: Text(
            'FoodLoop Dashboard',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24, 
              fontWeight: FontWeight.w500
              
            ),
          ),
        ),
        backgroundColor: Colors.orange,
      ),
      body:
          _isLoading
              ? Center(child: CircularProgressIndicator(color: Colors.orange))
              : RefreshIndicator(
                onRefresh: _loadData,
                child: ListView(
                  padding: EdgeInsets.all(16),
                  children: [
                    // AvailableDonationsScreen(),
                    Card(
                      elevation: 4,
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Recent Donations',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Divider(),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: 16),
                    // Conditional rendering based on user role
                    if (_userProfile['role'] == 'donor')
                      // Donor-specific dashboard widget
                      Card(
                        elevation: 4,
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Your Donation Stats',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Divider(),
                              ListTile(
                                leading: Icon(Icons.volunteer_activism, color: Colors.orange),
                                title: Text('Your Donations'),
                                trailing: Text(
                                  '${_impactStats['userDonations'] ?? 0}',
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                              ),
                              ElevatedButton(
                                onPressed: () => Navigator.pushNamed(context, '/donate'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.orange,
                                  foregroundColor: Colors.white,
                                ),
                                child: Text('Make a Donation'),
                              ),
                            ],
                          ),
                        ),
                      )
                    else if (_userProfile['role'] == 'NGO' || _userProfile['role'] == 'volunteer')
                      // NGO-specific dashboard widget
                      Card(
                        elevation: 4,
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ListTile(
                                leading: Icon(Icons.assignment_turned_in, color: Colors.orange),
                                title: Text('Claimed Donations'),
                                trailing: Text(
                                  '${_impactStats['ngoClaimedDonations'] ?? 0}',
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                              ),
                              
                            ],
                          ),
                        ),
                      ),
                    SizedBox(height: 16),
                    SizedBox(height: 16),
                  ],
                ),
              ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed, // Required when more than 3 items
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.orange,
        unselectedItemColor: Colors.grey,
        onTap: _onItemTapped,
        items: <BottomNavigationBarItem>[
          const BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.restaurant),
            label:  _userProfile['role'] == 'donor'? 'Donate' : 'Donations',
          ),
          const BottomNavigationBarItem(icon: Icon(Icons.location_on), label: 'Map'),
          const BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: 'Joy Loops',
          ),
          const BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
