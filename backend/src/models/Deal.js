import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  dealId: {
    type: String,
    unique: true,
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title must be 200 characters or less']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description must be 2000 characters or less']
  },
  category: {
    type: String,
    enum: {
      values: ['vehicle', 'real_estate', 'domain', 'freelancing', 'other'],
      message: 'Invalid category'
    },
    required: [true, 'Category is required']
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory must be 100 characters or less']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1000, 'Amount must be at least ₹1,000'],
    max: [100000000, 'Amount must be less than ₹10 crores']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR']
  },
  escrowFee: {
    type: Number,
    required: true
  },
  escrowFeePercentage: {
    type: Number,
    required: true
  },
  deliveryMethod: {
    type: String,
    enum: {
      values: ['in_person', 'courier', 'digital', 'other'],
      message: 'Invalid delivery method'
    },
    required: [true, 'Delivery method is required']
  },
  inspectionPeriod: {
    type: Number,
    required: [true, 'Inspection period is required'],
    min: [1, 'Inspection period must be at least 1 day'],
    max: [30, 'Inspection period must be 30 days or less']
  },
  additionalTerms: {
    type: String,
    maxlength: [1000, 'Additional terms must be 1000 characters or less'],
    default: ''
  },
  status: {
    type: String,
    enum: [
      'created',
      'accepted',
      'kyc_pending',
      'documents_pending',
      'payment_pending',
      'contract_pending',
      'funds_deposited',
      'in_delivery',
      'delivered',
      'completed',
      'disputed',
      'cancelled',
      'refunded'
    ],
    default: 'created'
  },
  workflow: {
    dealCreated: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    partiesAccepted: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      buyerAccepted: { type: Boolean, default: false },
      sellerAccepted: { type: Boolean, default: false },
      buyerAcceptedAt: Date,
      sellerAcceptedAt: Date
    },
    kycVerified: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      buyerKyc: { type: Boolean, default: false },
      sellerKyc: { type: Boolean, default: false }
    },
    documentsUploaded: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      buyerDocs: { type: Boolean, default: false },
      sellerDocs: { type: Boolean, default: false }
    },
    paymentDeposited: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      transactionId: String,
      paymentMethod: String
    },
    contractSigned: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      buyerSigned: { type: Boolean, default: false },
      sellerSigned: { type: Boolean, default: false },
      contractHash: String
    },
    itemDelivered: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      deliveryProof: [String]
    },
    buyerConfirmed: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String
    },
    fundsReleased: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      transactionId: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  deliveryDeadline: Date,
  inspectionDeadline: Date,
  completedAt: Date,
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    documentType: {
      type: String,
      enum: ['ownership', 'identity', 'agreement', 'delivery_proof', 'other'],
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  }],
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    raisedAt: Date,
    reason: String,
    description: String,
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'escalated'],
      default: 'open'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolution: String,
    resolvedAt: Date,
    evidence: [String]
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedAt: Date,
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  riskFactors: [String],
  ipAddress: String,
  userAgent: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
dealSchema.index({ dealId: 1 });
dealSchema.index({ buyer: 1 });
dealSchema.index({ seller: 1 });
dealSchema.index({ status: 1 });
dealSchema.index({ category: 1 });
dealSchema.index({ amount: 1 });
dealSchema.index({ createdAt: -1 });
dealSchema.index({ flagged: 1 });

// Pre-save middleware to generate deal ID
dealSchema.pre('save', async function(next) {
  if (!this.dealId) {
    const count = await mongoose.model('Deal').countDocuments();
    this.dealId = `ST${String(count + 1).padStart(6, '0')}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Method to get next action for user
dealSchema.methods.getNextAction = function(userId) {
  const userIdStr = userId.toString();
  const buyerIdStr = this.buyer.toString();
  const sellerIdStr = this.seller.toString();
  
  const isBuyer = userIdStr === buyerIdStr;
  const isSeller = userIdStr === sellerIdStr;
  
  if (!isBuyer && !isSeller) {
    return 'Not authorized for this deal';
  }
  
  switch (this.status) {
    case 'created':
      if (this.initiatedBy.toString() === userIdStr) {
        return 'Waiting for counterparty to accept';
      } else {
        return 'Accept or reject the deal';
      }
    case 'accepted':
      return 'Complete KYC verification';
    case 'kyc_pending':
      if ((isBuyer && !this.workflow.kycVerified.buyerKyc) || 
          (isSeller && !this.workflow.kycVerified.sellerKyc)) {
        return 'Complete KYC verification';
      } else {
        return 'Waiting for counterparty KYC';
      }
    case 'documents_pending':
      if ((isBuyer && !this.workflow.documentsUploaded.buyerDocs) || 
          (isSeller && !this.workflow.documentsUploaded.sellerDocs)) {
        return 'Upload required documents';
      } else {
        return 'Waiting for counterparty documents';
      }
    case 'payment_pending':
      if (isBuyer) {
        return 'Deposit payment into escrow';
      } else {
        return 'Waiting for buyer payment';
      }
    case 'contract_pending':
      if ((isBuyer && !this.workflow.contractSigned.buyerSigned) || 
          (isSeller && !this.workflow.contractSigned.sellerSigned)) {
        return 'Sign digital contract';
      } else {
        return 'Waiting for counterparty signature';
      }
    case 'funds_deposited':
      if (isSeller) {
        return 'Deliver item/service to buyer';
      } else {
        return 'Waiting for seller delivery';
      }
    case 'in_delivery':
      if (isSeller) {
        return 'Mark item as delivered';
      } else {
        return 'Waiting for delivery';
      }
    case 'delivered':
      if (isBuyer) {
        return 'Inspect and confirm receipt';
      } else {
        return 'Waiting for buyer confirmation';
      }
    case 'completed':
      return 'Deal completed successfully';
    case 'disputed':
      return 'Dispute in progress';
    case 'cancelled':
      return 'Deal cancelled';
    case 'refunded':
      return 'Funds refunded';
    default:
      return 'Unknown status';
  }
};

// Method to calculate progress percentage
dealSchema.methods.getProgress = function() {
  const totalSteps = 8;
  let completedSteps = 0;
  
  if (this.workflow.dealCreated.completed) completedSteps++;
  if (this.workflow.partiesAccepted.completed) completedSteps++;
  if (this.workflow.kycVerified.completed) completedSteps++;
  if (this.workflow.documentsUploaded.completed) completedSteps++;
  if (this.workflow.paymentDeposited.completed) completedSteps++;
  if (this.workflow.contractSigned.completed) completedSteps++;
  if (this.workflow.itemDelivered.completed) completedSteps++;
  if (this.workflow.fundsReleased.completed) completedSteps++;
  
  return Math.round((completedSteps / totalSteps) * 100);
};

// Method to check if user can perform action
dealSchema.methods.canUserPerformAction = function(userId, action) {
  const userIdStr = userId.toString();
  const buyerIdStr = this.buyer.toString();
  const sellerIdStr = this.seller.toString();
  
  const isBuyer = userIdStr === buyerIdStr;
  const isSeller = userIdStr === sellerIdStr;
  
  if (!isBuyer && !isSeller) return false;
  
  switch (action) {
    case 'accept_deal':
      return this.status === 'created' && this.initiatedBy.toString() !== userIdStr;
    case 'deposit_payment':
      return this.status === 'payment_pending' && isBuyer;
    case 'sign_contract':
      return this.status === 'contract_pending';
    case 'mark_delivered':
      return this.status === 'funds_deposited' && isSeller;
    case 'confirm_receipt':
      return this.status === 'delivered' && isBuyer;
    case 'raise_dispute':
      return ['funds_deposited', 'in_delivery', 'delivered'].includes(this.status);
    default:
      return false;
  }
};

const Deal = mongoose.model('Deal', dealSchema);

export default Deal;