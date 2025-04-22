import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import FoodListing from '../models/listing.model.js';
import Transaction from '../models/transaction.model.js';
import { predictCategory } from '../services/mlClient.js';

import fs from 'fs';
import { uploadToCloudinary } from '../utils/cloudinary.js';


export const createDonation = async (req, res) => {
  try {
    console.log("🛬 Incoming donation request...");
    console.log("Request body:", req.body);
    console.log("Uploaded files:", req.files || req.file);
    console.log("Authenticated user:", req.user);
    if (!req.files || req.files.length === 0) {
      throw new Error("No files uploaded");
    }
    const donorId = req.user.userId;

    const {
      foodDescription,
      hoursOld,
      storage,
      weight,
      expirationDate,
      lat,
      lng,
      scheduledFor
    } = req.body;

    const location = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };

    // ML prediction (fallback safe)
    let predictedCategory = 'other';
    try {
      predictedCategory = await predictCategory(foodDescription, hoursOld, storage);
    } catch (e) {
      console.warn('ML fallback: "other"', e);
    }

    const isPerishable = storage !== 'room temp';

    // Image uploads
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path);
        imageUrls.push(result.secure_url);

        // Remove local file after upload
        fs.unlink(file.path, (err) => {
          if (err) console.error("File delete failed:", err);
        });
      }
    }

    const donation = await FoodListing.create({
      donor: donorId,
      location,
      foodDescription,
      predictedCategory,
      hoursOld,
      storage,
      weight,
      expirationDate,
      scheduledFor,
      images: imageUrls,
      isPerishable
    });

    res.status(201).json({ success: true, donation });

  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({
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
        const userId = req.user.userId;

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

