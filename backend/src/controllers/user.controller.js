import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).lean(); // lean for plain JS object

    if (!user) return res.status(404).json({ error: 'User not found' });

    let totalDonations = 0;
    let averageMonthlyDonations = 0;
    let lastDonationDate = null;

    if (user.role === 'donor') {
      const donations = await Transaction.find({ donor: userId }).sort({ createdAt: -1 });

      totalDonations = donations.length;

      if (donations.length > 0) {
        const firstDonationDate = donations[donations.length - 1].createdAt;
        const months = Math.max(
          1,
          (new Date().getFullYear() - firstDonationDate.getFullYear()) * 12 +
          (new Date().getMonth() - firstDonationDate.getMonth())
        );

        averageMonthlyDonations = Math.round(totalDonations / months);
        lastDonationDate = donations[0].createdAt;
      }
    }

    res.json({
      name: user.name,
      role: user.role,
      email: user.email,
      organizationName: user.organizationName,
      contactNumber: user.contactNumber,
      address: user.address,
      website: user.website,
      foodPreferences: user.foodPreferences,
      needsVolunteer: user.needsVolunteer,
      totalDonations,
      averageMonthlyDonations,
      lastDonationDate
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};
