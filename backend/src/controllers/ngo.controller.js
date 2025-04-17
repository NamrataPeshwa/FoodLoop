import User from '../models/user.model.js';
import FoodListing from '../models/listing.model.js';

export const claimDonation = async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id);

        // Check if the donation exists and is still pending
        if (!listing || listing.status !== 'pending') {
            return res.status(400).json({ error: 'Donation not available for claim' });
        }

        // Update status and assign NGO (from logged in user)
        listing.status = 'requested';
        listing.ngoId = req.user._id;

        // Optional: if volunteerId is passed (in case a volunteer is assigned during claim)
        if (req.body.volunteerId) {
            listing.volunteer = req.body.volunteerId;
        }

        await listing.save();

        res.status(200).json({ message: 'Donation claimed successfully', listing });
    } catch (error) {
        console.error(error);
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
  