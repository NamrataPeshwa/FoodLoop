import axios from 'axios';
import FoodListing from '../models/listing.model.js';
import Transaction from '../models/transaction.model.js';

export const createDonation = async (req, res) => {
    try {
        const donation = new FoodListing({ ...req.body, donor: req.user.userId });
        await donation.save();

        // Auto-trigger proximity-based matching
        await axios.post('http://localhost:8000/api/transaction/match', {
            listingId: donation._id,
        });

        res.status(201).json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating donation' });
    }
};

export const getDonations = async (req, res) => {
    try {
        const matchedListings = await Transaction.find().distinct('foodListing');

        const donations = await FoodListing.find({
            status: 'pending',
            _id: { $nin: matchedListings }, // exclude already matched
        });

        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching donations' });
    }
};

export const getUserDonations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch donations and populate foodListing and certificateData
        const donations = await Transaction.find({ donor: userId })
            .populate('foodListing')
            .populate('ngo')         
            .select('foodListing ngo transactionHash certificateData')

        // Sending donations with certificateData included
        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching user donations' });
    }
};

