import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const foodListingSchema = new Schema(
  {
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true, index: '2dsphere' }, // [lng, lat]
    },

    donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    foodDescription: { 
      type: String, 
      required: true, 
      trim: true 
    },

    // 4) ML‐predicted meal category (snack, lunch, bfast, etc.)
    predictedCategory: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'other'],
      required: true
    },

    hoursOld: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    storage: {
      type: String,
      enum: ['room temp', 'refrigerated', 'frozen'],
      default: 'room temp'
    },

    weight: { type: String, required: true, trim: true },
    isPerishable: { type: Boolean, default: false },

    expirationDate: { type: Date, required: true },
    scheduledFor: { type: Date, default: null },

    listingCount: { type: Number, default: 1, min: 1 },

    status: {
      type: String,
      enum: ['pending', 'requested', 'confirmed'],
      default: 'pending',
      lowercase: true
    },
    ngoId: { type: Schema.Types.ObjectId, ref: 'User' },
    volunteer: { type: Schema.Types.ObjectId, ref: 'User' },

    images: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// TTL index for auto-expiring listings (only confirmed ones)
foodListingSchema.index(
  { updatedAt: 1 }, 
  { expireAfterSeconds: 3600, partialFilterExpression: { status: 'confirmed' } }
);

export default model('FoodListing', foodListingSchema);
