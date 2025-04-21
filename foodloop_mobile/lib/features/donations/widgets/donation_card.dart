import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DonationCard extends StatelessWidget {
  final Map<String, dynamic> donation;
  final VoidCallback? onTap;

  const DonationCard({
    super.key,
    required this.donation,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    String _getString(dynamic value, [String fallback = '']) {
      if (value is String) return value;
      if (value is Map) return value.toString();
      return value?.toString() ?? fallback;
    }

    final String title = _getString(donation['foodDescription'], 'Unknown Food');
    final String description = _getString(donation['expirationDate'], 'No description available');
    final String category = _getString(donation['predictedCategory'], 'Uncategorized');
    final String quantity = _getString(donation['listingCount'], 'Unknown');
    final String location = _getString(donation['location'], 'Location not specified');
    // Get the image URL(s) from the donation
    String imageUrl = '';
    if (donation['images'] != null) {
      if (donation['images'] is List && (donation['images'] as List).isNotEmpty) {
      imageUrl = _getString((donation['images'] as List).first);
      } else if (donation['images'] is String) {
      imageUrl = donation['images'] as String;
      }
    }
    final String status = _getString(donation['status'], 'Anonymous');

    // Format the date safely
    String formattedDate = 'Date not available';
    try {
      if (donation['createdAt'] != null) {
        final date = DateTime.parse(donation['createdAt']);
        formattedDate = DateFormat('MMM d, yyyy').format(date);
      }
    } catch (_) {
      formattedDate = 'Invalid date';
    }

    return Card(
      elevation: 3,
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: imageUrl.isNotEmpty
                  ? Image.network(
                      imageUrl,
                      height: 150,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        height: 150,
                        color: Colors.grey[300],
                        child: const Center(child: Icon(Icons.broken_image, size: 50)),
                      ),
                    )
                  : Container(
                      height: 150,
                      color: Colors.grey[300],
                      child: const Center(child: Icon(Icons.restaurant, size: 50)),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title & Category
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green[100],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          category,
                          style: TextStyle(color: Colors.green[800], fontSize: 12),
                        ),
                      ),
                      SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green[100],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          status,
                          style: TextStyle(color: Colors.green[800], fontSize: 12),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Description
                  Text(
                    description,
                    style: const TextStyle(fontSize: 14),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 12),

                  // Location
                  Row(
                    children: [
                      Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          location,
                          style: TextStyle(color: Colors.grey[600], fontSize: 14),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 4),

                  // Quantity & Date
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.restaurant, size: 16, color: Colors.grey[600]),
                          const SizedBox(width: 4),
                          Text(
                            'Qty: $quantity',
                            style: TextStyle(color: Colors.grey[600], fontSize: 14),
                          ),
                        ],
                      ),
                      Text(
                        formattedDate,
                        style: TextStyle(color: Colors.grey[600], fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
