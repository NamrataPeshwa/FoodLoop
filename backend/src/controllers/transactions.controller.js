import dotenv from "dotenv";
dotenv.config();
import express from "express";
import Transaction from "../models/transaction.model.js";
import FoodListing from "../models/listing.model.js";
import User from "../models/user.model.js";
import redisClient from "../utils/redis.js";
import { sendSMS } from "../services/notificationService.js";
import Web3 from "web3";
// import foodLoopAbi from "../blockchain/build/contracts/FoodLoop.json" assert { type: "json" };
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
// Load ABI manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const abiPath = path.join(
  __dirname,
  "../../blockchain/build/contracts/FoodLoop.json"
);
const foodLoopAbi = JSON.parse(await readFile(abiPath, "utf-8"));

import nodemailer from "nodemailer";
import fs from "fs";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendConfirmationEmail = async (email, name, message, confirmUrl, rejectUrl) => {
  const htmlPath = path.join(__dirname, "../views/confirmation.html");
  let html = fs.readFileSync(htmlPath, "utf8");

  html = html
    .replace("{{name}}", name)
    .replace("{{message}}", message)
    .replace("{{confirmUrl}}", confirmUrl)
    .replace("{{rejectUrl}}", rejectUrl);

  await transporter.sendMail({
    from: `"FoodLoop Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Please Confirm Participation",
    html,
  });
};


export const matchFoodListings = async (req, res) => {
  try {
    const now = new Date();

    // 1) Find all eligible listings
    const listings = await FoodListing.find({
      status: 'pending',
      scheduledFor: { $lte: now },
    })
      .sort({ isPerishable: -1, scheduledFor: 1 })
      .populate('donor');

    const matched = [];

    for (const listing of listings) {
      // 2) Skip if already has a pending or confirmed transaction
      const existingTx = await Transaction.findOne({
        foodListing: listing._id,
        status:     { $in: ['requested', 'confirmed'] }
      });
      if (existingTx) continue;

      // 3) Find closest NGO (with simple redisClient cache)
      const cacheKey = `ngo-near:${listing._id}`;
      let closestNGO = null;

      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const ngo = JSON.parse(cached);
        if (!ngo.foodPreferences.includes(listing.foodType)) {
          closestNGO = await User.findById(ngo._id);
        }
      }

      if (!closestNGO) {
        const ngos = await User.find({
          role: 'NGO',
          location: {
            $near: {
              $geometry: listing.location,
              $maxDistance: 10000
            }
          }
        });
        for (const ngo of ngos) {
          if (!ngo.foodPreferences.includes(listing.foodType)) {
            closestNGO = ngo;
            // cache minimal info
            await redisClient.set(cacheKey, JSON.stringify({
              _id: ngo._id.toString(),
              foodPreferences: ngo.foodPreferences
            }), 'EX', 300);
            break;
          }
        }
      }
      if (!closestNGO) continue;

      // 4) Find closest available volunteer if needed
      let closestVolunteer = null;
      if (listing.requiresVolunteer || closestNGO.needsVolunteer) {
        const day  = now.toLocaleDateString('en-US', { weekday: 'long' });
        const hour = now.getHours();

        closestVolunteer = await User.findOne({
          role: 'volunteer',
          location: {
            $near: {
              $geometry: listing.location,
              $maxDistance: 10000
            }
          },
          availability: {
            $elemMatch: {
              day,
              startHour: { $lte: hour },
              endHour:   { $gte: hour }
            }
          }
        });
      }

      // 5) Create the "requested" transaction
      const tx = await Transaction.create({
        foodListing: listing._id,
        donor:       listing.donor._id,
        ngo:         closestNGO._id,
        volunteer:   closestVolunteer?._id || null,
        status:      'requested',
        confirmedBy: []          // will accumulate NGO/volunteer IDs on confirm
      });

      // 6) Update the listing so it's no longer re-matched
      listing.status    = 'requested';
      listing.volunteer = closestVolunteer?._id || null;
      await listing.save();

      // 7) Send confirmation emails
      const base = process.env.BASE_URL;
      // NGO
      await sendConfirmationEmail(
        closestNGO.email,
        closestNGO.name,
        `A new food donation is available for you to claim.`,
        `${base}/confirm/${tx._id}/${closestNGO._id}`,
        `${base}/reject/${tx._id}/${closestNGO._id}`
      );
      // Volunteer (if any)
      if (closestVolunteer) {
        await sendConfirmationEmail(
          closestVolunteer.email,
          closestVolunteer.name,
          `Please confirm you can deliver this donation.`,
          `${base}/confirm/${tx._id}/${closestVolunteer._id}`,
          `${base}/reject/${tx._id}/${closestVolunteer._id}`
        );
      }

      matched.push(tx);
    }

    return res.status(200).json({
      success: true,
      matched: matched.length,
      transactions: matched
    });

  } catch (err) {
    console.error('matchFoodListings error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const web3 = new Web3(process.env.INFURA_URL);

const router = express.Router();
const CONTRACT_ADDRESS = "0xcF8E0d025aeF7eFD74f6F84fCa5F60B416F9D01d";

const contract = new web3.eth.Contract(foodLoopAbi.abi, CONTRACT_ADDRESS);
console.log("Private Key ENV:", process.env.INFURA_PRIVATE_KEY);

let account;

// if (!/^([a-fA-F0-9]{64})$/.test(process.env.INFURA_PRIVATE_KEY)) {
//   throw new Error("Invalid private key format");
// }

try {
  account = web3.eth.accounts.privateKeyToAccount(
    process.env.INFURA_PRIVATE_KEY.startsWith("0x")
      ? process.env.INFURA_PRIVATE_KEY
      : "0x" + process.env.INFURA_PRIVATE_KEY
  );
} catch (error) {
  console.error("Error with private key:", error.message);
  throw new Error("Invalid private key");
}

web3.eth.accounts.wallet.add(account);

export const confirmDeliveryAndMintNFT = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate("foodListing")
      .populate("donor")
      .populate("ngo");

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

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
      process.env.INFURA_PRIVATE_KEY.startsWith("0x")
        ? process.env.INFURA_PRIVATE_KEY
        : "0x" + process.env.INFURA_PRIVATE_KEY
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

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
      message: "Delivery confirmed and NFT minted on blockchain",
      certificateData,
    });
  } catch (error) {
    console.error("Minting Error:", error);
    res
      .status(500)
      .json({
        message: "Failed to confirm delivery on-chain",
        error: error.message,
      });
  }
};

export const updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, note } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role.toLowerCase(); // 'donor', 'ngo', 'volunteer', 'admin'

    // Define which roles may set which status
    const allowed = {
      requested: ["ngo"],
      picked_up: ["volunteer"],
      in_transit: ["volunteer"],
      delivered: ["ngo"],
      confirmed: ["admin"],
    };

    if (!allowed[status] || !allowed[status].includes(userRole)) {
      return res
        .status(403)
        .json({ error: "You are not allowed to set this status" });
    }

    // Fetch transaction
    const tx = await Transaction.findById(transactionId);
    if (!tx) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Append timeline event
    tx.timeline.push({
      status,
      by: userRole,
      note: note || "",
    });

    // If it's a final confirmation, mark confirmed flag
    if (status === "confirmed") {
      tx.confirmed = true;
    }

    await tx.save();

    return res.status(200).json({ success: true, timeline: tx.timeline });
  } catch (err) {
    console.error("Status update error:", err);
    return res.status(500).json({ error: "Server error updating status" });
  }
};

export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role.toLowerCase();

    // Build filter based on role
    let filter = {};
    if (role === "donor") {
      filter.donor = userId;
    } else if (role === "ngo") {
      filter.ngo = userId;
    } else if (role === "volunteer") {
      filter.volunteer = userId;
    } else if (role === "admin") {
      // no filter → all transactions
      filter = {};
    } else {
      return res.status(403).json({ success: false, message: "Invalid role" });
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "foodListing",
        select:
          "foodDescription predictedCategory weight location expirationDate status",
      })
      .populate("donor", "name email")
      .populate("ngo", "name email")
      .populate("volunteer", "name email")
      .lean();

    return res.json({ success: true, transactions });
  } catch (err) {
    console.error("Error fetching user transactions:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const confirmParticipation = async (req, res) => {
  try {
    const { transactionId, userId } = req.params;

    // 1) Load the transaction
    const tx = await Transaction.findById(transactionId);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    // 2) Record this user's confirmation
    const isNGO       = tx.ngo.toString() === userId;
    const isVolunteer = tx.volunteer && tx.volunteer.toString() === userId;

    if (!isNGO && !isVolunteer) {
      return res.status(403).json({ error: 'Not authorised to confirm this transaction' });
    }

    // Avoid duplicate entries
    if (!tx.confirmedBy.includes(userId)) {
      tx.confirmedBy.push(userId);
      await tx.save();
    }

    // 3) Check if all required parties have confirmed
    const ngoConfirmed       = tx.confirmedBy.includes(tx.ngo.toString());
    const volunteerConfirmed = !tx.volunteer || tx.confirmedBy.includes(tx.volunteer.toString());

    if (ngoConfirmed && volunteerConfirmed) {
      // 4) Finalize on-chain status
      tx.status       = 'confirmed';
      tx.confirmedAt  = new Date();
      await tx.save();

      // 5) Update the underlying listing
      const listing = await FoodListing.findById(tx.foodListing).populate('donor');
      listing.status = 'confirmed';
      await listing.save();

      // 6) Fetch users for SMS
      const donor     = listing.donor;
      const ngoUser   = await User.findById(tx.ngo);
      const volunteer = tx.volunteer ? await User.findById(tx.volunteer) : null;

      // 7) Send SMS notifications
      await sendSMS(
        donor.contactNumber,
        `🎉 Hi ${donor.name}, your donation (ID: ${transactionId}) has been confirmed! Thank you for your generosity.`
      );
      await sendSMS(
        ngoUser.contactNumber,
        `✅ Hi ${ngoUser.name}, you’ve successfully claimed donation (ID: ${transactionId}).`
      );
      if (volunteer) {
        await sendSMS(
          volunteer.contactNumber,
          `🚚 Hi ${volunteer.name}, you’ve been confirmed to deliver donation (ID: ${transactionId}).`
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Confirmation received',
      status: tx.status
    });

  } catch (err) {
    console.error('confirmParticipation error:', err);
    return res.status(500).json({ error: 'Server error confirming participation' });
  }
};

export const rejectParticipation = async (req, res) => {
  const { transactionId, userId } = req.params;
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) return res.status(404).send("Transaction not found");

  await Transaction.findByIdAndDelete(transactionId);

  // Re-run matching for this foodListing
  const listing = await FoodListing.findById(transaction.foodListing);
  listing.status = "pending";
  await listing.save();
  await matchFoodListings(); // run again

  return res.send("Sorry to hear that. We’ll look for another match.");
};
