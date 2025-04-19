import User from '../models/user.model.js';
import FoodListing from '../models/listing.model.js';
import Transaction from '../models/Transaction.js';

// Claim a donation: sets listing to 'requested' and creates a Transaction with timeline
export const claimDonation = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);

    // Ensure listing exists and is pending
    if (!listing || listing.status !== 'pending') {
      return res.status(400).json({ error: 'Donation not available for claim' });
    }

    // Update listing status and assign NGO
    listing.status = 'requested';
    listing.ngoId = req.user._id;

    // Optional: assign volunteer if provided
    if (req.body.volunteerId) {
      listing.volunteer = req.body.volunteerId;
    }

    await listing.save();

    // Create a new Transaction record
    const transaction = new Transaction({
      foodListing: listing._id,
      donor: listing.donor,
      ngo: req.user._id,
      volunteer: listing.volunteer || null,
    });

    // Push the NGO 'requested' event onto the timeline
    transaction.timeline.push({ status: 'requested', by: 'ngo' });
    await transaction.save();

    return res.status(200).json({
      message: 'Donation claimed and transaction created successfully',
      listing,
      transaction,
    });
  } catch (error) {
    console.error('Error claiming donation:', error);
    return res.status(500).json({ error: 'Error claiming donation' });
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
  