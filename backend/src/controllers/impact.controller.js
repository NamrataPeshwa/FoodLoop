import Transaction from '../models/Transaction.js';
import FoodListing from '../models/FoodListing.js';
import User from '../models/User.js';

export const getImpactStats = async (req, res) => {
  try {
    // Total donations and total weight saved (as number)
    const donationStats = await Transaction.aggregate([
      {
        $lookup: {
          from: 'foodlistings',
          localField: 'foodListing',
          foreignField: '_id',
          as: 'listingDetails'
        }
      },
      { $unwind: '$listingDetails' },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: 1 },
          totalWeight: {
            $sum: {
              $toDouble: {
                $cond: [
                  { $regexMatch: { input: '$listingDetails.weight', regex: /^[0-9.]+$/ } },
                  '$listingDetails.weight',
                  0
                ]
              }
            }
          }
        }
      }
    ]);

    // Testimonials: Fetch 3 NGOs and their feedback (assuming it's stored in user schema or elsewhere)
    const testimonials = await User.find({ role: 'NGO' })
      .select('name organizationName')
      .limit(3)
      .lean();

    // Blockchain transaction count (based on confirmed txns with hash)
    const blockchainStats = await Transaction.countDocuments({
      confirmed: true,
      transactionHash: { $exists: true, $ne: null }
    });

    // Environmental impact (e.g., estimate CO2 saved as 2.5kg per 1kg food saved)
    const totalKg = donationStats[0]?.totalWeight || 0;
    const estimatedCO2Saved = +(totalKg * 2.5).toFixed(2);

    res.json({
      totalDonations: donationStats[0]?.totalDonations || 0,
      totalWeight: totalKg,
      estimatedCO2Saved,
      blockchainTransactions: blockchainStats,
      testimonials
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
