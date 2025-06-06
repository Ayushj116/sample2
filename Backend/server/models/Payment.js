import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Payment Identification
  paymentId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Associated Deal
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true
  },
  
  // Payment Parties
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR']
  },
  
  // Payment Type
  paymentType: {
    type: String,
    enum: ['escrow_deposit', 'escrow_release', 'fee_payment', 'refund'],
    required: true
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['upi', 'netbanking', 'debit_card', 'credit_card', 'wallet'],
    required: true
  },
  
  // Payment Gateway Details
  gateway: {
    provider: {
      type: String,
      enum: ['razorpay', 'payu', 'ccavenue'],
      required: true
    },
    transactionId: String,
    orderId: String,
    paymentId: String,
    signature: String,
    
    // Gateway Response
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed
    },
    
    // Fees
    gatewayFee: {
      type: Number,
      default: 0
    },
    gst: {
      type: Number,
      default: 0
    }
  },
  
  // Payment Status
  status: {
    type: String,
    enum: [
      'initiated',     // Payment initiated
      'pending',       // Waiting for user action
      'processing',    // Being processed by gateway
      'captured',      // Payment captured successfully
      'failed',        // Payment failed
      'cancelled',     // Payment cancelled by user
      'refunded',      // Payment refunded
      'partially_refunded', // Partial refund
      'disputed'       // Payment disputed
    ],
    default: 'initiated'
  },
  
  // Bank Details (for refunds/releases)
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String
  },
  
  // Escrow Details
  escrow: {
    escrowAccount: String,
    holdStartDate: Date,
    holdEndDate: Date,
    releaseDate: Date,
    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    releaseReason: {
      type: String,
      enum: ['deal_completed', 'buyer_confirmed', 'dispute_resolved', 'admin_release', 'timeout']
    }
  },
  
  // Refund Details
  refund: {
    refundAmount: Number,
    refundReason: String,
    refundDate: Date,
    refundTransactionId: String,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Fee Breakdown
  fees: {
    escrowFee: {
      type: Number,
      default: 0
    },
    escrowFeePercentage: {
      type: Number,
      default: 0
    },
    processingFee: {
      type: Number,
      default: 0
    },
    gst: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  capturedAt: Date,
  failedAt: Date,
  refundedAt: Date,
  
  // Failure Details
  failureReason: String,
  failureCode: String,
  
  // Retry Information
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  nextRetryAt: Date,
  
  // Compliance and Risk
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  riskFactors: [String],
  
  // Fraud Detection
  fraudCheck: {
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'manual_review'],
      default: 'pending'
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    checkedAt: Date,
    flags: [String]
  },
  
  // Notifications
  notifications: {
    payerNotified: {
      type: Boolean,
      default: false
    },
    payeeNotified: {
      type: Boolean,
      default: false
    },
    adminNotified: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceFingerprint: String,
    sessionId: String
  },
  
  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    oldStatus: String,
    newStatus: String
  }],
  
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
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ deal: 1 });
paymentSchema.index({ payer: 1 });
paymentSchema.index({ payee: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentType: 1 });
paymentSchema.index({ 'gateway.provider': 1 });
paymentSchema.index({ 'gateway.transactionId': 1 });
paymentSchema.index({ createdAt: -1 });

// Pre-save middleware to generate payment ID
paymentSchema.pre('save', async function(next) {
  if (!this.paymentId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentId = `PAY${String(count + 1).padStart(8, '0')}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Method to add audit trail entry
paymentSchema.methods.addAuditEntry = function(action, performedBy, details, oldStatus, newStatus) {
  this.auditTrail.push({
    action,
    performedBy,
    details,
    oldStatus,
    newStatus,
    timestamp: new Date()
  });
};

// Method to update status with audit trail
paymentSchema.methods.updateStatus = function(newStatus, performedBy, details) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Update relevant timestamps
  switch (newStatus) {
    case 'processing':
      this.processedAt = new Date();
      break;
    case 'captured':
      this.capturedAt = new Date();
      break;
    case 'failed':
      this.failedAt = new Date();
      break;
    case 'refunded':
      this.refundedAt = new Date();
      break;
  }
  
  this.addAuditEntry(`Status changed to ${newStatus}`, performedBy, details, oldStatus, newStatus);
};

// Method to check if payment can be refunded
paymentSchema.methods.canRefund = function() {
  return ['captured'].includes(this.status) && 
         this.paymentType === 'escrow_deposit' &&
         !this.refund.refundDate;
};

// Method to check if payment is in escrow
paymentSchema.methods.isInEscrow = function() {
  return this.status === 'captured' && 
         this.paymentType === 'escrow_deposit' &&
         !this.escrow.releaseDate;
};

// Method to calculate total amount including fees
paymentSchema.methods.getTotalAmount = function() {
  return this.amount + this.fees.totalFees;
};

// Method to check if payment needs retry
paymentSchema.methods.needsRetry = function() {
  return this.status === 'failed' && 
         this.retryCount < this.maxRetries &&
         (!this.nextRetryAt || this.nextRetryAt <= new Date());
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;