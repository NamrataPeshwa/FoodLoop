import 'package:flutter/material.dart';
import 'package:foodloop_mobile/features/donations/services/joy_loop_service.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';

class JoyLoopsScreen extends StatefulWidget {
  @override
  _JoyLoopsScreenState createState() => _JoyLoopsScreenState();
}

class _JoyLoopsScreenState extends State<JoyLoopsScreen> with SingleTickerProviderStateMixin {
  final _joyLoopService = JoyLoopService();
  final _contentController = TextEditingController();
  late TabController _tabController;
  List<dynamic> _joyMoments = [];
  List<dynamic> _topDonors = [];
  List<dynamic> _joySpreaders = [];
  bool _isLoading = true;
  bool _isSubmitting = false;
  File? _selectedImage;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }
  
  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    try {
      final moments = await _joyLoopService.getJoyMoments();
      final donors = await _joyLoopService.getTopDonors();
      final spreaders = await _joyLoopService.getJoySpreaders();
      
      setState(() {
        _joyMoments = moments;
        _topDonors = donors;
        _joySpreaders = spreaders;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading joy loops: $e'))
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    
    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
      });
    }
  }
  
  Future<void> _submitJoyMoment() async {
    if (_contentController.text.isEmpty && _selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please add text or an image to share'))
      );
      return;
    }
    
    setState(() => _isSubmitting = true);
    
    try {
      await _joyLoopService.postJoyMoment(
        _contentController.text,
        _selectedImage,
      );
      
      _contentController.clear();
      setState(() => _selectedImage = null);
      
      // Refresh joy moments
      final moments = await _joyLoopService.getJoyMoments();
      setState(() => _joyMoments = moments);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Joy moment shared successfully!'))
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error sharing joy moment: $e'))
      );
    } finally {
      setState(() => _isSubmitting = false);
    }
  }
  
  Widget _buildJoyMomentsList() {
    if (_joyMoments.isEmpty) {
      return Center(
        child: Text('No joy moments yet. Be the first to share!'),
      );
    }
    
    return ListView.builder(
      itemCount: _joyMoments.length,
      itemBuilder: (context, index) {
        final moment = _joyMoments[index];
        return Card(
          margin: EdgeInsets.symmetric(vertical: 8, horizontal: 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ListTile(
                leading: CircleAvatar(
                  child: Icon(Icons.person),
                ),
                title: Text(moment['donor']['name'] ?? 'Anonymous'),
                subtitle: Text('Shared a joy moment'),
              ),
              if (moment['caption'] != null && moment['caption'].isNotEmpty)
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Text(moment['caption']),
                ),
              if (moment['image'] != null)
                Image.network(
                  moment['image'],
                  fit: BoxFit.cover,
                  width: double.infinity,
                  errorBuilder: (context, error, stackTrace) => 
                    Center(child: Icon(Icons.broken_image, size: 100)),
                ),
              Padding(
                padding: EdgeInsets.all(8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    TextButton.icon(
                      onPressed: () {},
                      icon: Icon(Icons.favorite_border),
                      label: Text('Like'),
                    ),
                    TextButton.icon(
                      onPressed: () {},
                      icon: Icon(Icons.comment),
                      label: Text('Comment'),
                    ),
                    TextButton.icon(
                      onPressed: () {},
                      icon: Icon(Icons.share),
                      label: Text('Share'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  Widget _buildDonorsList() {
    return ListView.builder(
      itemCount: _topDonors.length,
      itemBuilder: (context, index) {
        final donor = _topDonors[index];
        return ListTile(
          leading: CircleAvatar(
            child: Text('${index + 1}'),
            backgroundColor: index == 0 ? Colors.amber : 
                           index == 1 ? Colors.grey[300] :
                           index == 2 ? Colors.brown[300] : Colors.orange[100],
          ),
          title: Text(donor['name'] ?? 'Anonymous'),
          subtitle: Text('${donor['totalDonations']} donations'),
          trailing: Icon(Icons.star, color: Colors.amber),
        );
      },
    );
  }
  
  Widget _buildSpreadersList() {
    return ListView.builder(
      itemCount: _joySpreaders.length,
      itemBuilder: (context, index) {
        final spreader = _joySpreaders[index];
        return ListTile(
          leading: CircleAvatar(
            child: Text('${index + 1}'),
            backgroundColor: index == 0 ? Colors.amber : 
                           index == 1 ? Colors.grey[300] :
                           index == 2 ? Colors.brown[300] : Colors.orange[100],
          ),
          title: Text(spreader['name'] ?? 'Anonymous'),
          subtitle: Text('${spreader['spreadCount']} deliveries'),
          trailing: Icon(Icons.volunteer_activism, color: Colors.red),
        );
      },
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Joy Loops'),
        backgroundColor: Colors.orange,
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(icon: Icon(Icons.favorite), text: 'Joy Moments'),
            Tab(icon: Icon(Icons.restaurant), text: 'Top Donors'),
            Tab(icon: Icon(Icons.volunteer_activism), text: 'Joy Spreaders'),
          ],
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: Colors.orange))
          : Column(
              children: [
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildJoyMomentsList(),
                      _buildDonorsList(),
                      _buildSpreadersList(),
                    ],
                  ),
                ),
                if (_tabController.index == 0)
                  Container(
                    padding: EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black12,
                          blurRadius: 4,
                          offset: Offset(0, -2),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        if (_selectedImage != null)
                          Stack(
                            alignment: Alignment.topRight,
                            children: [
                              Container(
                                height: 100,
                                width: double.infinity,
                                margin: EdgeInsets.only(bottom: 8),
                                decoration: BoxDecoration(
                                  image: DecorationImage(
                                    image: FileImage(_selectedImage!),
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                              IconButton(
                                icon: Icon(Icons.close, color: Colors.white),
                                onPressed: () {
                                  setState(() => _selectedImage = null);
                                },
                              ),
                            ],
                          ),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _contentController,
                                decoration: InputDecoration(
                                  hintText: 'Share a joy moment...',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(30),
                                  ),
                                ),
                                maxLines: null,
                              ),
                            ),
                            IconButton(
                              icon: Icon(Icons.image, color: Colors.orange),
                              onPressed: _pickImage,
                            ),
                            IconButton(
                              icon: Icon(Icons.send, color: Colors.orange),
                              onPressed: _isSubmitting ? null : _submitJoyMoment,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
              ],
            ),
    );
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    _contentController.dispose();
    super.dispose();
  }
}