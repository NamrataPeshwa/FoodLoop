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
    
    print('User profile loaded: $userProfile'); // Debug output
    
    setState(() {
      _userProfile = userProfile;
      _impactStats = impactStats;
    });
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error loading data: $e'))
    );
  } finally {
    setState(() => _isLoading = false);
  }
  }
  
  Widget _buildImpactCard() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Community Impact',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            Divider(),
            ListTile(
              leading: Icon(Icons.restaurant, color: Colors.orange),
              title: Text('Total Donations'),
              trailing: Text(
                '${_impactStats['totalDonations'] ?? 0}',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
            ListTile(
              leading: Icon(Icons.scale, color: Colors.orange),
              title: Text('Food Saved (kg)'),
              trailing: Text(
                '${_impactStats['totalWeight'] ?? 0}',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
            ListTile(
              leading: Icon(Icons.eco, color: Colors.green),
              title: Text('CO₂ Saved (kg)'),
              trailing: Text(
                '${_impactStats['estimatedCO2Saved'] ?? 0}',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildUserCard() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your Profile',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            Divider(),
            ListTile(
              leading: Icon(Icons.person, color: Colors.orange),
              title: Text('Name'),
              subtitle: Text(_userProfile['name'] ?? ''),
            ),
            ListTile(
              leading: Icon(Icons.email, color: Colors.orange),
              title: Text('Email'),
              subtitle: Text(_userProfile['email'] ?? ''),
            ),
            ListTile(
              leading: Icon(Icons.work, color: Colors.orange),
              title: Text('Role'),
              subtitle: Text(_userProfile['role'] ?? ''),
            ),
            if (_userProfile['role'] == 'donor')
              ListTile(
                leading: Icon(Icons.restaurant, color: Colors.orange),
                title: Text('Total Donations'),
                subtitle: Text('${_userProfile['totalDonations'] ?? 0}'),
              ),
          ],
        ),
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('FoodLoop Dashboard'),
        backgroundColor: Colors.orange,
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () async {
              await _authService.logout();
              Navigator.pushReplacementNamed(context, '/login');
            },
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.orange,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: Colors.white,
                    child: Text(
                      _userProfile['name']?.substring(0, 1) ?? 'U',
                      style: TextStyle(fontSize: 24, color: Colors.orange),
                    ),
                  ),
                  SizedBox(height: 10),
                  Text(
                    _userProfile['name'] ?? 'User',
                    style: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  Text(
                    _userProfile['email'] ?? '',
                    style: TextStyle(color: Colors.white70),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: Icon(Icons.dashboard),
              title: Text('Dashboard'),
              selected: true,
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: Icon(Icons.restaurant),
              title: Text('Donate Food'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/donate');
              },
            ),
            ListTile(
              leading: Icon(Icons.map),
              title: Text('Food Map'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/map');
              },
            ),
            ListTile(
              leading: Icon(Icons.favorite),
              title: Text('Joy Loops'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/joyloops');
              },
            ),
            if (_userProfile['role'] == 'NGO')
              ListTile(
                leading: Icon(Icons.settings),
                title: Text('Preferences'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/ngo-preferences');
                },
              ),
          ],
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: Colors.orange))
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: EdgeInsets.all(16),
                children: [
                  _buildUserCard(),
                  SizedBox(height: 16),
                  _buildImpactCard(),
                ],
              ),
            ),
    );
  }
}