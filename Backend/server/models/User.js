import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  
  // Account Type
  userType: {
    type: String,
    enum: ['personal', 'business'],
    required: true,
    default: 'personal'
  },
  
  // Business Information (for business accounts)
  businessName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  businessType: {
    type: String,
    enum: ['proprietorship', 'partnership', 'private_limited', 'public_limited', 'llp'],
    required: function() { return this.userType === 'business'; }
  },
  gstin: {
    type: String,
    trim: true,
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  },
  
  // Verification Status
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'approved', 'rejected'],
    default: 'pending'
  },
  kycLevel: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    default: 'basic'
  },
  
  // Security
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  
  // Profile
  avatar: {
    type: String // URL to profile image
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: {
      type: String,
      match: /^[1-9][0-9]{5}$/
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Banking Information
  bankAccounts: [{
    accountNumber: {
      type: String,
      required: true
    },
    ifscCode: {
      type: String,
      required: true,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/
    },
    bankName: {
      type: String,
      required: true
    },
    accountHolderName: {
      type: String,
      required: true
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Statistics
  totalDeals: {
    type: Number,
    default: 0
  },
  completedDeals: {
    type: Number,
    default: 0
  },
  totalVolume: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Preferences
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  
  // Admin fields
  isAdmin: {
    type: Boolean,
    default: false
  },
  adminRole: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    required: function() { return this.isAdmin; }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ kycStatus: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    avatar: this.avatar,
    userType: this.userType,
    businessName: this.businessName,
    kycStatus: this.kycStatus,
    rating: this.rating,
    totalDeals: this.totalDeals,
    completedDeals: this.completedDeals,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;