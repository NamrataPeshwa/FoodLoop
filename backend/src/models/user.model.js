import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true }, 
    role: { type: String, enum: ['donor', 'NGO', 'volunteer', 'admin', 'business'], required: true },

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
    active: { type: Boolean, default: true },
    flagged: { 
      type: Boolean, 
      default: false 
    },
    flagReason: { 
      type: String 
    },
    verificationNotes: {
      type: String
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
verificationStatus: {
  type: String,
  enum: ['verified', 'pending', 'flagged'],
  default: 'pending'
},
lastActive: {
  type: Date,
  default: Date.now
},
donationsCount: {
  type: Number,
  default: 0
},
totalDonated: {
  type: Number,  // Store as number for calculations
  default: 0
},
volunteeredHours: {
  type: Number,
  default: 0
},
distributionsCount: {
  type: Number,
  default: 0
},
peopleHelped: {
  type: Number,
  default: 0
}
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.index({ location: '2dsphere' });

const User = model('User', userSchema, 'users');
export default User;
