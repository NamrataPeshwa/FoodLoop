import Transaction from '../models/transaction.model.js';
import express from 'express';

import FoodListing from '../models/listing.model.js';
import User from '../models/user.model.js';
import redis from '../utils/redis.js';
import twilio from 'twilio';
import { sendSMS } from '../services/notificationService.js';
import Web3 from "web3";
// import foodLoopAbi from "../blockchain/build/contracts/FoodLoop.json" assert { type: "json" };
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// Load ABI manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const abiPath = path.join(__dirname, '../../blockchain/build/contracts/FoodLoop.json');
const foodLoopAbi = JSON.parse(await readFile(abiPath, 'utf-8'));



export const matchFoodListings = async (req, res) => {
  try {
    const now = new Date();

    const listings = await FoodListing.find({
      status: 'pending',
      scheduledFor: { $lte: now },
    })
      .sort({ isPerishable: -1, scheduledFor: 1 })
      .populate('donor');

    const matchedTransactions = [];

    for (const listing of listings) {
      const alreadyMatched = await Transaction.findOne({ foodListing: listing._id });
      if (alreadyMatched) continue;

      const cacheKey = `ngo-near:${listing._id}`;
      let closestNGO = null;

      const cachedNGO = await redis.get(cacheKey);
      if (cachedNGO) {
        const parsedNGO = JSON.parse(cachedNGO);
        if (!parsedNGO.foodPreferences?.includes(listing.foodType)) {
          closestNGO = parsedNGO;
        }
      }

      if (!closestNGO) {
        const nearbyNGOs = await User.find({
          role: 'NGO',
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: listing.location.coordinates
              },
              $maxDistance: 10000
            }
          }
        });

        for (const ngo of nearbyNGOs) {
          if (!ngo.foodPreferences.includes(listing.foodType)) {
            closestNGO = ngo;
            await redis.set(cacheKey, JSON.stringify({
              _id: ngo._id,
              foodPreferences: ngo.foodPreferences,
              autoConfirm: ngo.autoConfirm,
              needsVolunteer: ngo.needsVolunteer
            }), 'EX', 300);
            break;
          }
        }
      }

      if (!closestNGO) continue;

      // ✅ Find volunteer if needed by listing or NGO
      let closestVolunteer = null;
      const needsVolunteer = listing.requiresVolunteer || closestNGO.needsVolunteer;

      if (needsVolunteer) {
        closestVolunteer = await User.findOne({
          role: 'volunteer',
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: listing.location.coordinates
              },
              $maxDistance: 10000
            }
          }
        });
      }

      const transaction = await Transaction.create({
        foodListing: listing._id,
        donor: listing.donor._id,
        ngo: closestNGO._id,
        volunteer: closestVolunteer ? closestVolunteer._id : null,
        status: closestNGO.autoConfirm ? 'confirmed' : 'requested',
        confirmedAt: closestNGO.autoConfirm ? new Date() : null
      });

      listing.status = 'requested';
      listing.volunteer = closestVolunteer ? closestVolunteer._id : null;
      await listing.save();

      matchedTransactions.push(transaction);

      await sendSMS(closestVolunteer?.contactNumber, `Message content here...`);
await sendSMS(listing.donor.contactNumber, `Message for donor`);
await sendSMS(closestNGO.contactNumber, `Message for NGO`);
    }

    return res.status(200).json({
      success: true,
      matched: matchedTransactions.length,
      transactions: matchedTransactions,
    });
  } catch (err) {
    console.error('Transaction matching error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const web3 = new Web3(process.env.INFURA_URL);

const router = express.Router();
const CONTRACT_ADDRESS = "0xcF8E0d025aeF7eFD74f6F84fCa5F60B416F9D01d";

const contract = new web3.eth.Contract(
    foodLoopAbi.abi,
    CONTRACT_ADDRESS
  );

  const account = web3.eth.accounts.privateKeyToAccount(process.env.INFURA_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);

  export const confirmDeliveryAndMintNFT = async (req, res) => {
    try {
      const { transactionId } = req.params;
  
      const transaction = await Transaction.findById(transactionId)
        .populate('foodListing')
        .populate('donor')
        .populate('ngo');
  
      if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
  
      const { foodListing, donor } = transaction;
  
      const deliveryId = transaction._id.toString().slice(-10);
      const donorAddress = process.env.DEFAULT_WALLET;
      const foodType = foodListing.foodType;
      const weight = foodListing.weight;
      const location = `Lat: ${foodListing.location.coordinates[1]}, Lng: ${foodListing.location.coordinates[0]}`;
      const timestamp = new Date().toISOString();
  
      const txData = contract.methods.confirmDeliveryAndMintNFT(
        deliveryId,
        donorAddress,
        foodType,
        weight,
        location,
        timestamp
      );
  
      const signedTx = await web3.eth.accounts.signTransaction(
        {
          to: process.env.CONTRACT_ADDRESS,
          data: txData.encodeABI(),
          gas: 500000,
        },
        '0x' + process.env.INFURA_PRIVATE_KEY
      );
  
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
      // Save transaction hash and update confirmation status
      transaction.transactionHash = receipt.transactionHash;
      transaction.confirmed = true;
  
      // Prepare certificate data
      const certificateData = {
        transactionHash: receipt.transactionHash,
        nftTokenId: receipt.logs[0].topics[3], //  depends on how the contract is emitting events
        donorName: donor.name,
        donorEmail: donor.email,
        foodType: foodListing.foodType,
        weight: foodListing.weight,
        location: location,
        timestamp: timestamp,
        date: new Date().toLocaleString(),
      };
  
      transaction.certificateData = certificateData;
  
      await transaction.save();
  
      res.status(200).json({
        message: 'Delivery confirmed and NFT minted on blockchain',
        certificateData,
      });
  
    } catch (error) {
      console.error('Minting Error:', error);
      res.status(500).json({ message: 'Failed to confirm delivery on-chain', error: error.message });
    }
  };
  