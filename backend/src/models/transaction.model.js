import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const donationTransactionSchema = new Schema(
  {
    foodListing: { type: Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ngo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    volunteer: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // Optional
    transactionHash: { type: String, default: null }, // Stores blockchain transaction hash
    confirmed: { type: Boolean, default: false }, // Indicates successful blockchain confirmation
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
