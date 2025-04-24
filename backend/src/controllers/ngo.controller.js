import User from '../models/user.model.js';
import FoodListing from '../models/listing.model.js';
import Transaction from '../models/transaction.model.js';

// Claim a donation: sets listing to 'requested' and creates a Transaction with timeline
export const claimDonation = async (req, res) => {
  try {
    console.log("🔍 Claiming donation ID:", req.params.id);
    console.log("👤 Authenticated user:", req.user);

    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      console.log("❌ Listing not found");
      return res.status(404).json({ error: "Donation not found" });
    }

    if (listing.status !== 'pending') {
      console.log("⚠️ Listing not pending:", listing.status);
      return res.status(400).json({ error: 'Donation not available for claim' });
    }

    listing.status = 'requested';
    listing.ngoId = req.user._id;

    if (req.body.volunteerId) {
      listing.volunteer = req.body.volunteerId;
    }

    await listing.save();
    console.log("✅ Listing updated");

    const transaction = new Transaction({
      foodListing: listing._id,
      donor: listing.donor,
      ngo: req.user._id,
      volunteer: listing.volunteer || null,
      timeline: [{ status: 'requested', by: 'ngo', at: new Date() }],
    });

    await transaction.save();
    console.log("✅ Transaction created");

    res.status(200).json({
      message: 'Donation claimed and transaction created successfully',
      listing,
      transaction,
    });
  } catch (error) {
    console.error('🚨 Error in claimDonation:', error);
    console.error('🧵 Stack Trace:', error.stack);
    res.status(500).json({ error: 'Error claiming donation' });
  }
};

export const updatePreferences = async (req, res) => {
    try {
      const userId = req.user._id;
      const { foodPreferences, needsVolunteer } = req.body;
  
      // Optional: Verify the user is NGO
      const user = await User.findById(userId);
      if (!user || user.role !== 'NGO') {
        return res.status(403).json({ success: false, message: 'Only NGOs can update preferences' });
      }
  
      // Update only if fields are provided
      if (Array.isArray(foodPreferences)) {
        user.foodPreferences = foodPreferences;
      }
  
      if (typeof needsVolunteer === 'boolean') {
        user.needsVolunteer = needsVolunteer;
      }
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        updatedFields: {
          foodPreferences: user.foodPreferences,
          needsVolunteer: user.needsVolunteer,
        },
      });
    } catch (err) {
      console.error('Preference update error:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  