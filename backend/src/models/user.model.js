import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: function () {
        return !this.googleId; // Only required for non-Google users
      },
    },
    email: { type: String, required: true },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: { type: String, unique: true, sparse: true }, 
    role: {
      type: String,
      enum: ['donor', 'NGO', 'volunteer', 'admin'],
      required: function () {
        return !this.googleId; // only require for non-Google users
      }
    },

    // Common fields for all roles
    organizationName: { type: String },
    contactNumber: { type: String },
    address: { type: String },
    website: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    
    // NGO specific fields
    foodPreferences: {
      type: [String], // Food types NGO doesn't want
      default: []
    },
    needsVolunteer: {
      type: Boolean, // NGO wants volunteer service?
      default: false,
    },
    certificates: {
      type: String, // URL to stored certificate file
    },
    
    // Donor specific fields
    foodTypes: {
      type: [String], // Types of food usually donated
      default: []
    },
    walletAddress: {
      type: String, // Blockchain wallet address
    },
    
    // Volunteer specific fields
    volunteerInterests: {
      type: [String], // Volunteer's interests
      default: []
    },
    associatedNGO: {
      type: String, // Name of NGO volunteer is associated with
    },
    
    // Donation history tracking
    averageMonthlyDonations: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    lastDonationDate: { type: Date },
    
    // System fields
    isVerified: { type: Boolean, default: false },
    profileCompleted: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (!this.password) return next(); // Skip hashing if password is empty (Google signup)

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});
userSchema.index({ location: '2dsphere' });

const User = model('User', userSchema, 'users');
export default User;
