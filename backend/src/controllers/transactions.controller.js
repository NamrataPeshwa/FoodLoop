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
        status:     { $in: ['pending', 'confirmed'] }
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
              $maxDistance: 500
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
        status:      'pending',
        confirmedBy: []          // will accumulate NGO/volunteer IDs on confirm
      });

      // 6) Update the listing so it's no longer re-matched
      listing.status    = 'requested';
      listing.volunteer = closestVolunteer?._id || null;
      await listing.save();

      // 7) Send confirmation emails
      const base = 'https://foodloop-72do.onrender.com';
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
    res.status(500).json({
      message: "Failed to confirm delivery on-chain",
      error: error.message,
    });
  }
};

export const getOrderTimeline = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validate orderId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization - users should only access orders they're involved with
    // Unless they're an admin
    if (!req.user.isAdmin) {
      const userRole = req.user.role;
      const userId = req.user._id;
      
      // Check if user is authorized to view this order
      if (
        (userRole === 'donor' && order.donor.toString() !== userId.toString()) ||
        (userRole === 'ngo' && order.ngo.toString() !== userId.toString()) ||
        (userRole === 'volunteer' && order.volunteer?.toString() !== userId.toString())
      ) {
        return res.status(403).json({ message: 'Not authorized to view this order timeline' });
      }
    }

    // Return timeline events
    return res.status(200).json({
      orderId: order._id,
      currentStatus: order.status,
      events: order.timeline || []
    });
  } catch (error) {
    console.error('Error fetching order timeline:', error);
    return res.status(500).json({ message: 'Server error while fetching timeline' });
  }
};

/**
 * Update order status and add timeline event
 * @route PUT /api/orders/:orderId/update-status
 */
export const updateOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    
    // Default to current user's role if not specified
    const by = req.body.by || req.user.role;
    
    // Validate orderId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    // Validate status
    const validStatuses = ['pending', 'requested', 'picked_up', 'in_transit', 'delivered', 'confirmed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Validate updater role
    const validRoles = ['system', 'donor', 'ngo', 'volunteer'];
    if (!validRoles.includes(by)) {
      return res.status(400).json({ message: 'Invalid role for status update' });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization for status update
    const userRole = req.user.role;
    const userId = req.user._id;

    // Get the status transition rules
    const allowedTransitions = getStatusTransitionRules(userRole);
    const currentStatus = order.status;

    // Check if the transition is allowed
    if (!isStatusTransitionAllowed(currentStatus, status, userRole, allowedTransitions)) {
      return res.status(403).json({ 
        message: `${userRole} cannot change status from ${currentStatus} to ${status}` 
      });
    }

    // Create timeline event
    const timelineEvent = {
      status,
      timestamp: new Date(),
      by,
      note: note || `Status updated to ${status}`
    };

    // Update order
    order.status = status;
    if (!order.timeline) {
      order.timeline = [];
    }
    order.timeline.push(timelineEvent);

    // Handle specific status updates
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'confirmed') {
      order.confirmedAt = new Date();
      // Trigger blockchain/NFT minting if relevant
      try {
        await triggerBlockchainConfirmation(order);
      } catch (blockchainError) {
        console.error('Blockchain confirmation error:', blockchainError);
        // Continue with save even if blockchain confirmation fails
        // The status will be updated and can be retried later
      }
    }

    await order.save();
    
    // Success response
    return res.status(200).json({
      message: 'Order status updated successfully',
      currentStatus: status,
      timelineEvent
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Server error while updating status' });
  }
};

export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
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
