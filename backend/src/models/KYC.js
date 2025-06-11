import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  kycType: {
    type: String,
    enum: ['personal', 'business'],
    required: true
  },
  kycLevel: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    default: 'basic'
  },
  personalInfo: {
    panNumber: {
      type: String,
      uppercase: true,
      match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    },
    panName: String,
    panDob: Date,
    panFatherName: String,
    aadhaarNumber: {
      type: String,
      match: /^[0-9]{12}$/
    },
    aadhaarName: String,
    aadhaarDob: Date,
    aadhaarAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String
    },
    currentAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      sameAsAadhaar: {
        type: Boolean,
        default: false
      }
    },
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
      accountHolderName: String,
      accountType: {
        type: String,
        enum: ['savings', 'current']
      }
    }
  },
  businessInfo: {
    businessName: String,
    businessType: {
      type: String,
      enum: ['proprietorship', 'partnership', 'private_limited', 'public_limited', 'llp']
    },
    registrationNumber: String,
    registrationDate: Date,
    registrationState: String,
    gstin: {
      type: String,
      match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    },
    gstRegistrationDate: Date,
    businessAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String
    },
    authorizedSignatory: {
      name: String,
      designation: String,
      panNumber: String,
      aadhaarNumber: String,
      email: String,
      phone: String
    },
    businessBankAccount: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
      accountHolderName: String
    }
  },
  documents: {
    panCard: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verificationNotes: String
    },
    aadhaarFront: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verificationNotes: String
    },
    aadhaarBack: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verificationNotes: String
    },
    bankStatement: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verificationNotes: String
    },
    addressProof: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verificationNotes: String
    },
    businessRegistration: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verificationNotes: String
    },
    gstCertificate: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verificationNotes: String
    },
    businessBankStatement: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verificationNotes: String
    },
    authorizedSignatoryId: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      },
      verificationNotes: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  verification: {
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    rejectionNotes: String,
    expiryDate: Date,
    documentScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    identityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    addressScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  riskAssessment: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    riskFactors: [String],
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    lastAssessedAt: Date
  },
  auditTrail: [{
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    ipAddress: String
  }],
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
kycSchema.index({ user: 1 });
kycSchema.index({ status: 1 });
kycSchema.index({ kycType: 1 });
kycSchema.index({ 'verification.submittedAt': -1 });

// Pre-save middleware
kycSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.status === 'approved' && !this.verification.expiryDate) {
    this.verification.expiryDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Method to check if KYC is complete
kycSchema.methods.isComplete = function() {
  if (this.kycType === 'personal') {
    return !!(
      this.personalInfo.panNumber &&
      this.personalInfo.aadhaarNumber &&
      this.documents.panCard.fileUrl &&
      this.documents.aadhaarFront.fileUrl &&
      this.documents.bankStatement.fileUrl
    );
  } else {
    return !!(
      this.businessInfo.businessName &&
      this.businessInfo.registrationNumber &&
      this.businessInfo.gstin &&
      this.documents.businessRegistration.fileUrl &&
      this.documents.gstCertificate.fileUrl &&
      this.personalInfo.panNumber &&
      this.documents.panCard.fileUrl
    );
  }
};

// Method to check if KYC is expired
kycSchema.methods.isExpired = function() {
  return this.verification.expiryDate && this.verification.expiryDate < new Date();
};

// Method to calculate completion percentage
kycSchema.methods.getCompletionPercentage = function() {
  let totalFields = 0;
  let completedFields = 0;
  
  if (this.kycType === 'personal') {
    totalFields = 8;
    
    if (this.personalInfo.panNumber) completedFields++;
    if (this.personalInfo.aadhaarNumber) completedFields++;
    if (this.personalInfo.bankAccount.accountNumber) completedFields++;
    if (this.personalInfo.currentAddress.line1) completedFields++;
    if (this.documents.panCard.fileUrl) completedFields++;
    if (this.documents.aadhaarFront.fileUrl) completedFields++;
    if (this.documents.bankStatement.fileUrl) completedFields++;
    if (this.documents.addressProof.fileUrl) completedFields++;
  } else {
    totalFields = 10;
    
    if (this.businessInfo.businessName) completedFields++;
    if (this.businessInfo.registrationNumber) completedFields++;
    if (this.businessInfo.gstin) completedFields++;
    if (this.businessInfo.authorizedSignatory.name) completedFields++;
    if (this.personalInfo.panNumber) completedFields++;
    if (this.documents.businessRegistration.fileUrl) completedFields++;
    if (this.documents.gstCertificate.fileUrl) completedFields++;
    if (this.documents.panCard.fileUrl) completedFields++;
    if (this.documents.businessBankStatement.fileUrl) completedFields++;
    if (this.documents.authorizedSignatoryId.fileUrl) completedFields++;
  }
  
  return Math.round((completedFields / totalFields) * 100);
};

// Method to add audit trail entry
kycSchema.methods.addAuditEntry = function(action, performedBy, details, ipAddress) {
  this.auditTrail.push({
    action,
    performedBy,
    details,
    ipAddress,
    timestamp: new Date()
  });
};

const KYC = mongoose.model('KYC', kycSchema);

export default KYC;