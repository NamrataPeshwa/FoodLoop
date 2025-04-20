import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const timelineEventSchema = new Schema({
  status: {
    type: String,
    enum: [
      'pending',       // just created/matched
      'requested',     // NGO has requested pickup
      'picked_up',     // volunteer has picked it up
      'in_transit',    // on the way
      'delivered',     // delivered to NGO
      'confirmed'      // blockchain confirmation / NFT minted
    ],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  by: {
    // Who triggered it: 'system', 'ngo', 'volunteer', 'donor'
    type: String,
    enum: ['system','donor','ngo','volunteer'],
    default: 'system'
  },
  note: { type: String } // optional free‐text
}, { _id: false });

const donationTransactionSchema = new Schema(
  {
    foodListing: { type: Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ngo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    volunteer: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // Optional
    transactionHash: { type: String, default: null }, // Stores blockchain transaction hash
    confirmed: { type: Boolean, default: false }, // Indicates successful blockchain confirmation
    timeline: {
      type: [timelineEventSchema],
      default: [
        { status: 'pending', by: 'system' }
      ]
    },
    certificateData: {
      transactionHash: String,
      nftTokenId: String,
      donorName: String,
      donorEmail: String,
      foodType: String,
      weight: Number,
      location: String,
      timestamp: String,
      date: String,
    },
  },
  { timestamps: true }
);

export default model('Transaction', donationTransactionSchema);
