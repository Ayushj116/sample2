import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  dealId: {
    type: String,
    unique: true
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
      sellerDocs: { type: Boolean, default: false },
      buyerRequiredDocs: [String], // Track which docs buyer needs
      sellerRequiredDocs: [String], // Track which docs seller needs
      buyerUploadedDocs: [String], // Track which docs buyer uploaded
      sellerUploadedDocs: [String] // Track which docs seller uploaded
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
dealSchema.index({ buyer: 1 });
dealSchema.index({ seller: 1 });
dealSchema.index({ status: 1 });
dealSchema.index({ category: 1 });
dealSchema.index({ amount: 1 });
dealSchema.index({ createdAt: -1 });
dealSchema.index({ flagged: 1 });

// Pre-save middleware to generate deal ID and initialize required documents
dealSchema.pre('save', async function(next) {
  if (!this.dealId) {
    // Generate a more unique deal ID using timestamp and random number
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.dealId = `ST${timestamp}${random}`.toUpperCase();
  }
  
  // Initialize required documents arrays if not set
  if (!this.workflow.documentsUploaded.buyerRequiredDocs || this.workflow.documentsUploaded.buyerRequiredDocs.length === 0) {
    const buyerDocs = this.getRequiredDocuments('buyer');
    this.workflow.documentsUploaded.buyerRequiredDocs = buyerDocs.filter(doc => doc.required).map(doc => doc.type);
  }
  
  if (!this.workflow.documentsUploaded.sellerRequiredDocs || this.workflow.documentsUploaded.sellerRequiredDocs.length === 0) {
    const sellerDocs = this.getRequiredDocuments('seller');
    this.workflow.documentsUploaded.sellerRequiredDocs = sellerDocs.filter(doc => doc.required).map(doc => doc.type);
  }
  
  // Initialize uploaded docs arrays if not set
  if (!this.workflow.documentsUploaded.buyerUploadedDocs) {
    this.workflow.documentsUploaded.buyerUploadedDocs = [];
  }
  if (!this.workflow.documentsUploaded.sellerUploadedDocs) {
    this.workflow.documentsUploaded.sellerUploadedDocs = [];
  }
  
  this.updatedAt = Date.now();
  next();
});

// Method to get required documents based on category and user role
dealSchema.methods.getRequiredDocuments = function(userRole) {
  const documents = {
    buyer: [],
    seller: []
  };

  // Seller always needs ownership/authenticity documents
  switch (this.category) {
    case 'vehicle':
      documents.seller = [
        { type: 'ownership', name: 'Vehicle Registration Certificate (RC)', required: true },
        { type: 'ownership', name: 'Insurance Certificate', required: true },
        { type: 'ownership', name: 'Pollution Certificate', required: false },
        { type: 'ownership', name: 'Service Records', required: false }
      ];
      break;
    case 'real_estate':
      documents.seller = [
        { type: 'ownership', name: 'Property Title Deed', required: true },
        { type: 'ownership', name: 'Property Tax Receipt', required: true },
        { type: 'ownership', name: 'NOC from Society/Builder', required: false },
        { type: 'ownership', name: 'Encumbrance Certificate', required: true }
      ];
      break;
    case 'domain':
      documents.seller = [
        { type: 'ownership', name: 'Domain Ownership Certificate', required: true },
        { type: 'ownership', name: 'Domain Transfer Authorization', required: true }
      ];
      break;
    case 'freelancing':
      documents.seller = [
        { type: 'agreement', name: 'Work Portfolio/Samples', required: true },
        { type: 'agreement', name: 'Project Specification Document', required: true }
      ];
      documents.buyer = [
        { type: 'agreement', name: 'Project Requirements Document', required: true }
      ];
      break;
    default:
      documents.seller = [
        { type: 'ownership', name: 'Proof of Ownership', required: true },
        { type: 'other', name: 'Item Description/Specification', required: true }
      ];
  }

  return documents[userRole] || [];
};

// Method to check if user has uploaded all required documents
dealSchema.methods.hasUserUploadedAllRequiredDocs = function(userId) {
  const userIdStr = userId.toString();
  const buyerIdStr = this.buyer._id ? this.buyer._id.toString() : this.buyer.toString();
  const sellerIdStr = this.seller._id ? this.seller._id.toString() : this.seller.toString();
  
  const isBuyer = userIdStr === buyerIdStr;
  const isSeller = userIdStr === sellerIdStr;
  
  if (isBuyer) {
    const requiredDocs = this.workflow.documentsUploaded.buyerRequiredDocs || [];
    const uploadedDocs = this.workflow.documentsUploaded.buyerUploadedDocs || [];
    return requiredDocs.length > 0 && requiredDocs.every(docType => uploadedDocs.includes(docType));
  } else if (isSeller) {
    const requiredDocs = this.workflow.documentsUploaded.sellerRequiredDocs || [];
    const uploadedDocs = this.workflow.documentsUploaded.sellerUploadedDocs || [];
    return requiredDocs.length > 0 && requiredDocs.every(docType => uploadedDocs.includes(docType));
  }
  
  return false;
};

// Method to update document upload status
dealSchema.methods.updateDocumentUploadStatus = function(userId, documentType) {
  const userIdStr = userId.toString();
  const buyerIdStr = this.buyer._id ? this.buyer._id.toString() : this.buyer.toString();
  const sellerIdStr = this.seller._id ? this.seller._id.toString() : this.seller.toString();
  
  const isBuyer = userIdStr === buyerIdStr;
  const isSeller = userIdStr === sellerIdStr;
  
  if (isBuyer) {
    if (!this.workflow.documentsUploaded.buyerUploadedDocs.includes(documentType)) {
      this.workflow.documentsUploaded.buyerUploadedDocs.push(documentType);
    }
    
    // Check if buyer has uploaded all required docs
    const requiredDocs = this.workflow.documentsUploaded.buyerRequiredDocs || [];
    const uploadedDocs = this.workflow.documentsUploaded.buyerUploadedDocs || [];
    this.workflow.documentsUploaded.buyerDocs = requiredDocs.length > 0 && 
      requiredDocs.every(docType => uploadedDocs.includes(docType));
  } else if (isSeller) {
    if (!this.workflow.documentsUploaded.sellerUploadedDocs.includes(documentType)) {
      this.workflow.documentsUploaded.sellerUploadedDocs.push(documentType);
    }
    
    // Check if seller has uploaded all required docs
    const requiredDocs = this.workflow.documentsUploaded.sellerRequiredDocs || [];
    const uploadedDocs = this.workflow.documentsUploaded.sellerUploadedDocs || [];
    this.workflow.documentsUploaded.sellerDocs = requiredDocs.length > 0 && 
      requiredDocs.every(docType => uploadedDocs.includes(docType));
  }
  
  // Check if both parties have completed their document uploads
  const buyerRequiredDocs = this.workflow.documentsUploaded.buyerRequiredDocs || [];
  const sellerRequiredDocs = this.workflow.documentsUploaded.sellerRequiredDocs || [];
  
  const buyerNeedsNoDocs = buyerRequiredDocs.length === 0;
  const sellerNeedsNoDocs = sellerRequiredDocs.length === 0;
  
  const buyerDocsComplete = buyerNeedsNoDocs || this.workflow.documentsUploaded.buyerDocs;
  const sellerDocsComplete = sellerNeedsNoDocs || this.workflow.documentsUploaded.sellerDocs;
  
  if (buyerDocsComplete && sellerDocsComplete && !this.workflow.documentsUploaded.completed) {
    this.workflow.documentsUploaded.completed = true;
    this.workflow.documentsUploaded.completedAt = new Date();
    this.status = 'payment_pending';
  }
};

// Method to get next action for user (now async to check KYC status)
dealSchema.methods.getNextAction = async function(userId) {
  // Convert ObjectIds to strings for comparison
  const userIdStr = userId.toString();
  const buyerIdStr = this.buyer._id ? this.buyer._id.toString() : this.buyer.toString();
  const sellerIdStr = this.seller._id ? this.seller._id.toString() : this.seller.toString();
  const initiatedByStr = this.initiatedBy._id ? this.initiatedBy._id.toString() : this.initiatedBy.toString();
  
  const isBuyer = userIdStr === buyerIdStr;
  const isSeller = userIdStr === sellerIdStr;
  const isInitiator = userIdStr === initiatedByStr;
  
  // Check if user is authorized for this deal
  if (!isBuyer && !isSeller) {
    return 'Not authorized for this deal';
  }
  
  // Import User and KYC models dynamically to avoid circular dependency
  const User = mongoose.model('User');
  const KYC = mongoose.model('KYC');
  
  switch (this.status) {
    case 'created':
      // Check individual acceptance status
      if (isBuyer && !this.workflow.partiesAccepted.buyerAccepted) {
        return 'Accept or reject the deal';
      } else if (isSeller && !this.workflow.partiesAccepted.sellerAccepted) {
        return 'Accept or reject the deal';
      } else if (isBuyer && this.workflow.partiesAccepted.buyerAccepted) {
        return 'Waiting for seller to accept';
      } else if (isSeller && this.workflow.partiesAccepted.sellerAccepted) {
        return 'Waiting for buyer to accept';
      }
      return 'Accept or reject the deal';
      
    case 'accepted':
      // Check KYC status from database - SELLER MUST COMPLETE KYC
      try {
        const [buyerUser, sellerUser] = await Promise.all([
          User.findById(buyerIdStr).select('kycStatus'),
          User.findById(sellerIdStr).select('kycStatus')
        ]);
        
        const buyerKycApproved = buyerUser?.kycStatus === 'approved';
        const sellerKycApproved = sellerUser?.kycStatus === 'approved';
        
        // SELLER KYC IS MANDATORY
        if (!sellerKycApproved) {
          if (isSeller) {
            return 'Complete KYC verification (Required for sellers)';
          } else {
            return 'Waiting for seller KYC verification - Send reminder';
          }
        }
        
        // If seller KYC is done, proceed to document upload
        return this.getDocumentUploadAction(userIdStr);
        
      } catch (error) {
        console.error('Error checking KYC status:', error);
        if (isSeller) {
          return 'Complete KYC verification (Required for sellers)';
        }
        return 'Waiting for seller KYC verification';
      }
      
    case 'kyc_pending':
      try {
        const [buyerUser, sellerUser] = await Promise.all([
          User.findById(buyerIdStr).select('kycStatus'),
          User.findById(sellerIdStr).select('kycStatus')
        
        ]);
        
        const sellerKycApproved = sellerUser?.kycStatus === 'approved';
        
        if (!sellerKycApproved) {
          if (isSeller) {
            return 'Complete KYC verification (Required for sellers)';
          } else {
            return 'Waiting for seller KYC verification - Send reminder';
          }
        } else {
          return this.getDocumentUploadAction(userIdStr);
        }
      } catch (error) {
        console.error('Error checking KYC status:', error);
        if (isSeller) {
          return 'Complete KYC verification (Required for sellers)';
        }
        return 'Waiting for seller KYC verification';
      }
      
    case 'documents_pending':
      return this.getDocumentUploadAction(userIdStr);
      
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

// Helper method to get document upload action
dealSchema.methods.getDocumentUploadAction = function(userIdStr) {
  const buyerIdStr = this.buyer._id ? this.buyer._id.toString() : this.buyer.toString();
  const sellerIdStr = this.seller._id ? this.seller._id.toString() : this.seller.toString();
  
  const isBuyer = userIdStr === buyerIdStr;
  const isSeller = userIdStr === sellerIdStr;
  
  // Get required documents for this user
  const requiredDocs = this.getRequiredDocuments(isBuyer ? 'buyer' : 'seller');
  const requiredDocTypes = requiredDocs.filter(doc => doc.required).map(doc => doc.type);
  
  if (requiredDocTypes.length === 0) {
    // No documents required for this role, check if counterparty needs to upload
    const counterpartyRole = isBuyer ? 'seller' : 'buyer';
    const counterpartyRequiredDocs = this.getRequiredDocuments(counterpartyRole);
    const counterpartyRequiredDocTypes = counterpartyRequiredDocs.filter(doc => doc.required).map(doc => doc.type);
    
    if (counterpartyRequiredDocTypes.length === 0) {
      // Neither party needs docs, proceed to payment
      if (isBuyer) {
        return 'Proceed to payment deposit';
      } else {
        return 'Waiting for buyer to deposit payment';
      }
    } else {
      // Check if counterparty has uploaded their docs
      const counterpartyUploadedDocs = isBuyer ? 
        (this.workflow.documentsUploaded.sellerUploadedDocs || []) :
        (this.workflow.documentsUploaded.buyerUploadedDocs || []);
      
      const counterpartyHasAllDocs = counterpartyRequiredDocTypes.every(type => counterpartyUploadedDocs.includes(type));
      
      if (counterpartyHasAllDocs) {
        if (isBuyer) {
          return 'Proceed to payment deposit';
        } else {
          return 'Waiting for buyer to deposit payment';
        }
      } else {
        return 'Waiting for counterparty documents';
      }
    }
  }
  
  // Check if user has uploaded all required documents
  const userUploadedDocs = isBuyer ? 
    (this.workflow.documentsUploaded.buyerUploadedDocs || []) :
    (this.workflow.documentsUploaded.sellerUploadedDocs || []);
  
  const hasAllRequiredDocs = requiredDocTypes.every(type => userUploadedDocs.includes(type));
  
  if (hasAllRequiredDocs) {
    // User has uploaded all required docs, check if counterparty needs to upload
    const counterpartyRole = isBuyer ? 'seller' : 'buyer';
    const counterpartyRequiredDocs = this.getRequiredDocuments(counterpartyRole);
    const counterpartyRequiredDocTypes = counterpartyRequiredDocs.filter(doc => doc.required).map(doc => doc.type);
    
    if (counterpartyRequiredDocTypes.length === 0) {
      // Counterparty doesn't need docs, proceed to payment
      if (isBuyer) {
        return 'Proceed to payment deposit';
      } else {
        return 'Waiting for buyer to deposit payment';
      }
    } else {
      // Check if counterparty has uploaded their docs
      const counterpartyUploadedDocs = isBuyer ? 
        (this.workflow.documentsUploaded.sellerUploadedDocs || []) :
        (this.workflow.documentsUploaded.buyerUploadedDocs || []);
      
      const counterpartyHasAllDocs = counterpartyRequiredDocTypes.every(type => counterpartyUploadedDocs.includes(type));
      
      if (counterpartyHasAllDocs) {
        if (isBuyer) {
          return 'Proceed to payment deposit';
        } else {
          return 'Waiting for buyer to deposit payment';
        }
      } else {
        return 'Waiting for counterparty documents';
      }
    }
  } else {
    // User still needs to upload documents
    const missingTypes = requiredDocTypes.filter(type => !userUploadedDocs.includes(type));
    const missingDocNames = requiredDocs.filter(doc => doc.required && missingTypes.includes(doc.type)).map(doc => doc.name);
    
    return `Upload required documents: ${missingDocNames.slice(0, 2).join(', ')}${missingDocNames.length > 2 ? ` and ${missingDocNames.length - 2} more` : ''}`;
  }
};

// Method to calculate progress percentage - FIXED VERSION
dealSchema.methods.getProgress = function() {
  // Define all possible workflow steps
  const workflowSteps = [
    'dealCreated',
    'partiesAccepted', 
    'kycVerified',
    'documentsUploaded',
    'paymentDeposited',
    'contractSigned',
    'itemDelivered',
    'buyerConfirmed',
    'fundsReleased'
  ];
  
  let completedSteps = 0;
  
  // Count completed steps
  workflowSteps.forEach(step => {
    if (this.workflow[step] && this.workflow[step].completed) {
      completedSteps++;
    }
  });
  
  // Special handling for completed deals
  if (this.status === 'completed') {
    // Ensure all critical steps are marked as complete for completed deals
    const criticalSteps = ['dealCreated', 'partiesAccepted', 'paymentDeposited', 'itemDelivered', 'buyerConfirmed', 'fundsReleased'];
    let criticalCompleted = 0;
    
    criticalSteps.forEach(step => {
      if (this.workflow[step] && this.workflow[step].completed) {
        criticalCompleted++;
      }
    });
    
    // If all critical steps are done, return 100%
    if (criticalCompleted === criticalSteps.length) {
      return 100;
    }
    
    // Otherwise, ensure at least 90% for completed deals
    return Math.max(90, Math.round((completedSteps / workflowSteps.length) * 100));
  }
  
  // For disputed deals, show progress based on how far they got
  if (this.status === 'disputed') {
    return Math.round((completedSteps / workflowSteps.length) * 100);
  }
  
  // For cancelled/refunded deals, show minimal progress
  if (['cancelled', 'refunded'].includes(this.status)) {
    return Math.min(25, Math.round((completedSteps / workflowSteps.length) * 100));
  }
  
  return Math.round((completedSteps / workflowSteps.length) * 100);
};

// Method to check if user can perform action
dealSchema.methods.canUserPerformAction = function(userId, action) {
  const userIdStr = userId.toString();
  const buyerIdStr = this.buyer._id ? this.buyer._id.toString() : this.buyer.toString();
  const sellerIdStr = this.seller._id ? this.seller._id.toString() : this.seller.toString();
  
  const isBuyer = userIdStr === buyerIdStr;
  const isSeller = userIdStr === sellerIdStr;
  
  if (!isBuyer && !isSeller) return false;
  
  switch (action) {
    case 'accept_deal':
      // Only allow acceptance if deal is in 'created' status and user hasn't already accepted
      if (this.status !== 'created') return false;
      
      if (isBuyer && this.workflow.partiesAccepted.buyerAccepted) return false;
      if (isSeller && this.workflow.partiesAccepted.sellerAccepted) return false;
      
      return true;
      
    case 'deposit_payment':
      return this.status === 'payment_pending' && isBuyer;
    case 'sign_contract':
      return this.status === 'contract_pending';
    case 'mark_delivered':
      return this.status === 'funds_deposited' && isSeller;
    case 'confirm_receipt':
      return this.status === 'delivered' && isBuyer;
    case 'raise_dispute':
      return ['funds_deposited', 'in_delivery', 'delivered'].includes(this.status) && !this.dispute.isDisputed;
    default:
      return false;
  }
};

// Method to raise a dispute
dealSchema.methods.raiseDispute = function(userId, reason, description) {
  if (!this.canUserPerformAction(userId, 'raise_dispute')) {
    throw new Error('Cannot raise dispute at this stage');
  }
  
  this.dispute.isDisputed = true;
  this.dispute.raisedBy = userId;
  this.dispute.raisedAt = new Date();
  this.dispute.reason = reason;
  this.dispute.description = description;
  this.dispute.status = 'open';
  this.status = 'disputed';
  
  // Add system message
  this.messages.push({
    sender: userId,
    message: `Dispute raised: ${reason}`,
    isSystemMessage: true
  });
};

const Deal = mongoose.model('Deal', dealSchema);

export default Deal;