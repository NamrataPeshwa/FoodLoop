import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import FoodListing from '../models/listing.model.js';
import Transaction from '../models/transaction.model.js';
import { predictCategory } from '../services/mlClient.js';

export const createDonation = async (req, res) => {
  try {
    const {
      foodDescription,
      hoursOld,
      storage,
      weight,
      expirationDate,
      location,
      images,
      scheduledFor
    } = req.body;

    // 1) Get ML prediction
    const predictedCategory = await predictCategory(
      foodDescription,
      hoursOld,
      storage
    );

    // 2) Determine perishability
    // anything not shelf‑stable is perishable
    const isPerishable = storage !== 'room temp';

    // 3) Build & save the listing
    const donation = await FoodListing.create({
      donor:              req.user._id,
      location,   
      foodDescription,
      predictedCategory,
      hoursOld,
      storage,
      weight,
      expirationDate,
      images,
      scheduledFor,
      isPerishable
      // listingCount, status, volunteer, ngoId — all defaults
    });

    await axios.post(
      `${process.env.BACKEND_URL}/api/transactions/match`,
      { listingId: donation._id }
    );

    return res.status(201).json({ success: true, donation });
  } catch (error) {
    console.error('Error creating donation:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not create donation',
      details: error.message
    });
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

