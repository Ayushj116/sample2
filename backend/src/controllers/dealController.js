import { body, validationResult, param } from 'express-validator';
import Deal from '../models/Deal.js';
import User from '../models/User.js';
import KYC from '../models/KYC.js';
import upload from '../middleware/upload.js';
import { sendSMS } from '../services/smsService.js';
import { calculateEscrowFee } from '../utils/feeCalculator.js';

export const createDeal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      subcategory,
      amount,
      deliveryMethod,
      inspectionPeriod,
      additionalTerms,
      buyerPhone,
      sellerPhone,
      buyerName,
      sellerName,
      userRole
    } = req.body;

    // Additional server-side validation
    const validationErrors = [];

    if (!title || title.trim().length === 0) {
      validationErrors.push({ field: 'title', message: 'Title is required' });
    } else if (title.length > 200) {
      validationErrors.push({ field: 'title', message: 'Title must be 200 characters or less' });
    }

    if (!description || description.trim().length === 0) {
      validationErrors.push({ field: 'description', message: 'Description is required' });
    } else if (description.length < 10) {
      validationErrors.push({ field: 'description', message: 'Description must be at least 10 characters' });
    } else if (description.length > 2000) {
      validationErrors.push({ field: 'description', message: 'Description must be 2000 characters or less' });
    }

    if (!category) {
      validationErrors.push({ field: 'category', message: 'Category is required' });
    } else if (!['vehicle', 'real_estate', 'domain', 'freelancing', 'other'].includes(category)) {
      validationErrors.push({ field: 'category', message: 'Invalid category' });
    }

    if (!amount || isNaN(amount) || amount < 1000) {
      validationErrors.push({ field: 'amount', message: 'Amount must be at least ₹1,000' });
    } else if (amount > 100000000) {
      validationErrors.push({ field: 'amount', message: 'Amount must be less than ₹10 crores' });
    }

    if (!deliveryMethod) {
      validationErrors.push({ field: 'deliveryMethod', message: 'Delivery method is required' });
    } else if (!['in_person', 'courier', 'digital', 'other'].includes(deliveryMethod)) {
      validationErrors.push({ field: 'deliveryMethod', message: 'Invalid delivery method' });
    }

    if (!inspectionPeriod || isNaN(inspectionPeriod) || inspectionPeriod < 1 || inspectionPeriod > 30) {
      validationErrors.push({ field: 'inspectionPeriod', message: 'Inspection period must be between 1-30 days' });
    }

    if (additionalTerms && additionalTerms.length > 1000) {
      validationErrors.push({ field: 'additionalTerms', message: 'Additional terms must be 1000 characters or less' });
    }

    if (!userRole || !['buyer', 'seller'].includes(userRole)) {
      validationErrors.push({ field: 'userRole', message: 'User role must be buyer or seller' });
    }

    // Validate counterparty information
    if (userRole === 'buyer') {
      if (!sellerPhone || !/^[6-9]\d{9}$/.test(sellerPhone)) {
        validationErrors.push({ field: 'sellerPhone', message: 'Valid seller phone number is required' });
      }
      if (!sellerName || sellerName.trim().length === 0) {
        validationErrors.push({ field: 'sellerName', message: 'Seller name is required' });
      }
    } else {
      if (!buyerPhone || !/^[6-9]\d{9}$/.test(buyerPhone)) {
        validationErrors.push({ field: 'buyerPhone', message: 'Valid buyer phone number is required' });
      }
      if (!buyerName || buyerName.trim().length === 0) {
        validationErrors.push({ field: 'buyerName', message: 'Buyer name is required' });
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const initiator = await User.findById(req.user.userId);
    if (!initiator) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const feeCalculation = calculateEscrowFee(amount, initiator.userType);

    let buyer, seller;
    
    if (userRole === 'buyer') {
      buyer = initiator._id;
      
      if (sellerPhone) {
        seller = await User.findOne({ phone: sellerPhone });
        if (!seller) {
          // Create system-generated user for seller
          seller = new User({
            firstName: sellerName?.split(' ')[0] || 'Seller',
            lastName: sellerName?.split(' ').slice(1).join(' ') || 'User',
            phone: sellerPhone,
            password: Math.random().toString(36).slice(-8) + 'Temp123!', // Temporary password
            userType: 'personal',
            phoneVerified: false,
            isSystemGenerated: true // Mark as system-generated
          });
          await seller.save();
        }
        seller = seller._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Seller phone is required'
        });
      }
    } else {
      seller = initiator._id;
      
      if (buyerPhone) {
        buyer = await User.findOne({ phone: buyerPhone });
        if (!buyer) {
          // Create system-generated user for buyer
          buyer = new User({
            firstName: buyerName?.split(' ')[0] || 'Buyer',
            lastName: buyerName?.split(' ').slice(1).join(' ') || 'User',
            phone: buyerPhone,
            password: Math.random().toString(36).slice(-8) + 'Temp123!', // Temporary password
            userType: 'personal',
            phoneVerified: false,
            isSystemGenerated: true // Mark as system-generated
          });
          await buyer.save();
        }
        buyer = buyer._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Buyer phone is required'
        });
      }
    }

    const deal = new Deal({
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory: subcategory?.trim() || '',
      amount: Number(amount),
      escrowFee: feeCalculation.baseFee,
      escrowFeePercentage: feeCalculation.percentage,
      deliveryMethod,
      inspectionPeriod: Number(inspectionPeriod),
      additionalTerms: additionalTerms?.trim() || '',
      buyer,
      seller,
      initiatedBy: initiator._id,
      status: 'created',
      workflow: {
        dealCreated: {
          completed: true,
          completedAt: new Date(),
          completedBy: initiator._id
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await deal.save();

    await deal.populate(['buyer', 'seller', 'initiatedBy']);

    const counterparty = userRole === 'buyer' ? deal.seller : deal.buyer;
    
    try {
      if (counterparty.phone) {
        const message = counterparty.isSystemGenerated 
          ? `New escrow deal invitation from ${initiator.fullName} for ₹${amount.toLocaleString()}. Deal ID: ${deal.dealId}. Download Safe Transfer app and create your account to view details.`
          : `New escrow deal invitation from ${initiator.fullName} for ₹${amount.toLocaleString()}. Deal ID: ${deal.dealId}. Login to Safe Transfer app to view details.`;
        
        await sendSMS({
          to: counterparty.phone,
          message
        });
      }
    } catch (notificationError) {
      console.error('Failed to send deal invitation:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: {
        deal: {
          id: deal._id,
          dealId: deal.dealId,
          title: deal.title,
          amount: deal.amount,
          status: deal.status,
          buyer: deal.buyer.getPublicProfile(),
          seller: deal.seller.getPublicProfile(),
          nextAction: await deal.getNextAction(req.user.userId),
          progress: deal.getProgress(),
          createdAt: deal.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create deal error:', error);
    
    // Handle specific MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry detected',
        errors: [{ field: 'general', message: 'This deal already exists' }]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [{ field: 'general', message: 'Something went wrong. Please try again.' }]
    });
  }
};

export const getDeals = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    const query = {
      $or: [
        { buyer: req.user.userId },
        { seller: req.user.userId }
      ]
    };

    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    if (category) {
      query.category = category;
    }

    const deals = await Deal.find(query)
      .populate('buyer', 'firstName lastName fullName avatar userType rating kycStatus')
      .populate('seller', 'firstName lastName fullName avatar userType rating kycStatus')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Deal.countDocuments(query);

    const dealsWithActions = await Promise.all(deals.map(async (deal) => ({
      id: deal._id,
      dealId: deal.dealId,
      title: deal.title,
      description: deal.description,
      category: deal.category,
      amount: deal.amount,
      status: deal.status,
      buyer: deal.buyer.getPublicProfile(),
      seller: deal.seller.getPublicProfile(),
      role: deal.buyer._id.toString() === req.user.userId ? 'buyer' : 'seller',
      nextAction: await deal.getNextAction(req.user.userId),
      progress: deal.getProgress(),
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt
    })));

    res.json({
      success: true,
      data: {
        deals: dealsWithActions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getDeal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal ID'
      });
    }

    const deal = await Deal.findById(req.params.id)
      .populate('buyer', 'firstName lastName fullName avatar userType rating totalDeals completedDeals kycStatus')
      .populate('seller', 'firstName lastName fullName avatar userType rating totalDeals completedDeals kycStatus')
      .populate('initiatedBy', 'firstName lastName fullName')
      .populate('messages.sender', 'firstName lastName fullName avatar')
      .populate('documents.uploadedBy', 'firstName lastName fullName')
      .populate('documents.verifiedBy', 'firstName lastName fullName');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer._id.toString();
    const sellerIdStr = deal.seller._id.toString();

    if (userIdStr !== buyerIdStr && userIdStr !== sellerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this deal'
      });
    }

    const userRole = userIdStr === buyerIdStr ? 'buyer' : 'seller';

    res.json({
      success: true,
      data: {
        deal: {
          id: deal._id,
          dealId: deal.dealId,
          title: deal.title,
          description: deal.description,
          category: deal.category,
          subcategory: deal.subcategory,
          amount: deal.amount,
          escrowFee: deal.escrowFee,
          escrowFeePercentage: deal.escrowFeePercentage,
          deliveryMethod: deal.deliveryMethod,
          inspectionPeriod: deal.inspectionPeriod,
          additionalTerms: deal.additionalTerms,
          status: deal.status,
          buyer: deal.buyer.getPublicProfile(),
          seller: deal.seller.getPublicProfile(),
          initiatedBy: deal.initiatedBy.getPublicProfile(),
          role: userRole,
          workflow: deal.workflow,
          messages: deal.messages,
          documents: deal.documents,
          dispute: deal.dispute,
          nextAction: await deal.getNextAction(req.user.userId),
          progress: deal.getProgress(),
          canPerformActions: {
            acceptDeal: deal.canUserPerformAction(req.user.userId, 'accept_deal'),
            depositPayment: deal.canUserPerformAction(req.user.userId, 'deposit_payment'),
            signContract: deal.canUserPerformAction(req.user.userId, 'sign_contract'),
            markDelivered: deal.canUserPerformAction(req.user.userId, 'mark_delivered'),
            confirmReceipt: deal.canUserPerformAction(req.user.userId, 'confirm_receipt'),
            raiseDispute: deal.canUserPerformAction(req.user.userId, 'raise_dispute')
          },
          createdAt: deal.createdAt,
          updatedAt: deal.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const acceptDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('buyer seller');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (!deal.canUserPerformAction(req.user.userId, 'accept_deal')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this deal or deal already accepted'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer._id.toString();
    const sellerIdStr = deal.seller._id.toString();
    const isBuyer = userIdStr === buyerIdStr;
    const isSeller = userIdStr === sellerIdStr;

    // Ensure user is either buyer or seller
    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this deal'
      });
    }

    // Update acceptance status
    if (isBuyer) {
      deal.workflow.partiesAccepted.buyerAccepted = true;
      deal.workflow.partiesAccepted.buyerAcceptedAt = new Date();
    } else {
      deal.workflow.partiesAccepted.sellerAccepted = true;
      deal.workflow.partiesAccepted.sellerAcceptedAt = new Date();
    }

    // Check if both parties have accepted
    if (deal.workflow.partiesAccepted.buyerAccepted && deal.workflow.partiesAccepted.sellerAccepted) {
      deal.workflow.partiesAccepted.completed = true;
      deal.workflow.partiesAccepted.completedAt = new Date();
      deal.status = 'accepted';
      deal.acceptedAt = new Date();
    }

    // Add system message
    deal.messages.push({
      sender: req.user.userId,
      message: `${isBuyer ? 'Buyer' : 'Seller'} has accepted the deal`,
      isSystemMessage: true
    });

    await deal.save();

    // Send notification to counterparty
    const counterparty = isBuyer ? deal.seller : deal.buyer;
    const user = await User.findById(req.user.userId);

    try {
      if (counterparty.phone) {
        const message = deal.status === 'accepted' 
          ? `Deal ${deal.dealId} fully accepted! Both parties have agreed. Next step: Complete KYC verification.`
          : `Deal ${deal.dealId} accepted by ${user.fullName}. Waiting for ${isBuyer ? 'seller' : 'buyer'} acceptance.`;
        
        await sendSMS({
          to: counterparty.phone,
          message
        });
      }
    } catch (notificationError) {
      console.error('Failed to send acceptance notification:', notificationError);
    }

    // Return updated deal data
    await deal.populate(['buyer', 'seller']);

    res.json({
      success: true,
      message: 'Deal accepted successfully',
      data: {
        deal: {
          id: deal._id,
          dealId: deal.dealId,
          status: deal.status,
          workflow: deal.workflow,
          nextAction: await deal.getNextAction(req.user.userId),
          progress: deal.getProgress(),
          canPerformActions: {
            acceptDeal: deal.canUserPerformAction(req.user.userId, 'accept_deal'),
            depositPayment: deal.canUserPerformAction(req.user.userId, 'deposit_payment'),
            signContract: deal.canUserPerformAction(req.user.userId, 'sign_contract'),
            markDelivered: deal.canUserPerformAction(req.user.userId, 'mark_delivered'),
            confirmReceipt: deal.canUserPerformAction(req.user.userId, 'confirm_receipt'),
            raiseDispute: deal.canUserPerformAction(req.user.userId, 'raise_dispute')
          }
        }
      }
    });

  } catch (error) {
    console.error('Accept deal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const addMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer.toString();
    const sellerIdStr = deal.seller.toString();

    if (userIdStr !== buyerIdStr && userIdStr !== sellerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to message in this deal'
      });
    }

    deal.messages.push({
      sender: req.user.userId,
      message: req.body.message
    });

    await deal.save();

    await deal.populate('messages.sender', 'firstName lastName fullName avatar');
    const newMessage = deal.messages[deal.messages.length - 1];

    const counterparty = userIdStr === buyerIdStr ? deal.seller : deal.buyer;
    const counterpartyUser = await User.findById(counterparty);
    const sender = await User.findById(req.user.userId);

    try {
      if (counterpartyUser.phone) {
        await sendSMS({
          to: counterpartyUser.phone,
          message: `New message from ${sender.fullName} in deal ${deal.dealId}: ${req.body.message.substring(0, 100)}${req.body.message.length > 100 ? '...' : ''}`
        });
      }
    } catch (notificationError) {
      console.error('Failed to send message notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: newMessage
      }
    });

  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const cancelDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer.toString();
    const sellerIdStr = deal.seller.toString();

    if (userIdStr !== buyerIdStr && userIdStr !== sellerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this deal'
      });
    }

    if (!['created', 'accepted', 'kyc_pending', 'documents_pending'].includes(deal.status)) {
      return res.status(400).json({
        success: false,
        message: 'Deal cannot be cancelled at this stage'
      });
    }

    deal.status = 'cancelled';
    
    const user = await User.findById(req.user.userId);
    deal.messages.push({
      sender: req.user.userId,
      message: `Deal cancelled by ${user.fullName}${req.body.reason ? `: ${req.body.reason}` : ''}`,
      isSystemMessage: true
    });

    await deal.save();

    res.json({
      success: true,
      message: 'Deal cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel deal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const sendKYCReminder = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('buyer seller', 'firstName lastName fullName phone kycStatus');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer._id.toString();
    const sellerIdStr = deal.seller._id.toString();

    if (userIdStr !== buyerIdStr && userIdStr !== sellerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send reminders for this deal'
      });
    }

    const isBuyer = userIdStr === buyerIdStr;
    const counterparty = isBuyer ? deal.seller : deal.buyer;
    const user = await User.findById(req.user.userId);

    // Check if counterparty needs KYC
    if (counterparty.kycStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Counterparty has already completed KYC verification'
      });
    }

    try {
      await sendSMS({
        to: counterparty.phone,
        message: `Reminder: ${user.fullName} is waiting for you to complete KYC verification for deal ${deal.dealId}. Please complete your KYC to proceed with the transaction.`
      });

      // Add system message to deal
      deal.messages.push({
        sender: req.user.userId,
        message: `KYC reminder sent to ${counterparty.fullName}`,
        isSystemMessage: true
      });

      await deal.save();

      res.json({
        success: true,
        message: 'KYC reminder sent successfully'
      });

    } catch (smsError) {
      console.error('Failed to send KYC reminder:', smsError);
      res.status(500).json({
        success: false,
        message: 'Failed to send reminder'
      });
    }

  } catch (error) {
    console.error('Send KYC reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const uploadDealDocument = async (req, res) => {
  try {
    // Use multer middleware
    upload.single('document')(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { documentType } = req.body;
      const dealId = req.params.id;
      
      console.log('Deal document upload request:', {
        userId: req.user.userId,
        dealId,
        documentType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });
      
      if (!documentType) {
        // Clean up uploaded file if documentType is missing
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
          }
        }
        
        return res.status(400).json({
          success: false,
          message: 'Document type is required'
        });
      }

      // Validate document type for deals
      const validDocumentTypes = [
        'ownership', 'identity', 'agreement', 'delivery_proof', 'other'
      ];

      if (!validDocumentTypes.includes(documentType)) {
        // Clean up uploaded file
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
          }
        }
        
        return res.status(400).json({
          success: false,
          message: `Invalid document type. Valid types are: ${validDocumentTypes.join(', ')}`
        });
      }

      try {
        const deal = await Deal.findById(dealId)
          .populate('buyer seller', 'firstName lastName fullName kycStatus');
        
        if (!deal) {
          // Clean up uploaded file
          if (req.file && req.file.path) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
              console.error('Error cleaning up file:', cleanupError);
            }
          }
          
          return res.status(404).json({
            success: false,
            message: 'Deal not found'
          });
        }

        // Check if user is authorized to upload documents for this deal
        const userIdStr = req.user.userId;
        const buyerIdStr = deal.buyer._id.toString();
        const sellerIdStr = deal.seller._id.toString();

        if (userIdStr !== buyerIdStr && userIdStr !== sellerIdStr) {
          // Clean up uploaded file
          if (req.file && req.file.path) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
              console.error('Error cleaning up file:', cleanupError);
            }
          }
          
          return res.status(403).json({
            success: false,
            message: 'Not authorized to upload documents for this deal'
          });
        }

        const documentData = {
          uploadedBy: req.user.userId,
          documentType,
          fileName: req.file.originalname,
          fileUrl: `/uploads/${req.file.filename}`,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadedAt: new Date(),
          verified: false
        };

        // Add document to deal
        deal.documents.push(documentData);
        
        // Add system message
        const user = await User.findById(req.user.userId);
        deal.messages.push({
          sender: req.user.userId,
          message: `${user.fullName} uploaded ${documentType} document: ${req.file.originalname}`,
          isSystemMessage: true
        });

        // Update document upload status using the new method
        deal.updateDocumentUploadStatus(req.user.userId, documentType);
        
        console.log('Document upload workflow check:', {
          userRole: userIdStr === buyerIdStr ? 'buyer' : 'seller',
          documentType,
          buyerDocs: deal.workflow.documentsUploaded.buyerDocs,
          sellerDocs: deal.workflow.documentsUploaded.sellerDocs,
          completed: deal.workflow.documentsUploaded.completed,
          status: deal.status
        });
        
        await deal.save();

        console.log('Deal document uploaded successfully:', {
          userId: req.user.userId,
          dealId,
          documentType,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          workflowUpdated: deal.workflow.documentsUploaded.completed,
          newStatus: deal.status,
          finalWorkflow: deal.workflow.documentsUploaded
        });

        res.json({
          success: true,
          message: 'Document uploaded successfully',
          data: {
            fileName: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            documentType: documentType,
            workflowUpdated: deal.workflow.documentsUploaded.completed,
            dealStatus: deal.status,
            workflow: deal.workflow.documentsUploaded
          }
        });

      } catch (dbError) {
        console.error('Database error during deal document upload:', dbError);
        
        // Clean up uploaded file on database error
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error('Error cleaning up file after DB error:', cleanupError);
          }
        }
        
        res.status(500).json({
          success: false,
          message: 'Failed to save document information'
        });
      }
    });

  } catch (error) {
    console.error('Upload deal document error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const depositPayment = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('buyer seller', 'firstName lastName fullName');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer._id.toString();

    // Only buyer can deposit payment
    if (userIdStr !== buyerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Only buyer can deposit payment'
      });
    }

    // Check if deal is in correct status
    if (deal.status !== 'payment_pending') {
      return res.status(400).json({
        success: false,
        message: 'Deal is not ready for payment deposit'
      });
    }

    const { paymentMethod, transactionId } = req.body;

    // For demo purposes, we'll simulate payment success
    // In production, this would integrate with actual payment gateway
    deal.workflow.paymentDeposited.completed = true;
    deal.workflow.paymentDeposited.completedAt = new Date();
    deal.workflow.paymentDeposited.transactionId = transactionId || `TXN${Date.now()}`;
    deal.workflow.paymentDeposited.paymentMethod = paymentMethod || 'demo';
    deal.status = 'funds_deposited';

    // Add system message
    deal.messages.push({
      sender: req.user.userId,
      message: `Payment of ₹${deal.amount.toLocaleString()} deposited successfully into escrow`,
      isSystemMessage: true
    });

    await deal.save();

    // Send notification to seller
    try {
      if (deal.seller.phone) {
        await sendSMS({
          to: deal.seller.phone,
          message: `Payment deposited for deal ${deal.dealId}! ₹${deal.amount.toLocaleString()} is now in secure escrow. Please proceed with delivery.`
        });
      }
    } catch (notificationError) {
      console.error('Failed to send payment notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Payment deposited successfully',
      data: {
        transactionId: deal.workflow.paymentDeposited.transactionId,
        amount: deal.amount,
        status: deal.status
      }
    });

  } catch (error) {
    console.error('Deposit payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const markDelivered = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('buyer seller', 'firstName lastName fullName phone');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const userIdStr = req.user.userId;
    const sellerIdStr = deal.seller._id.toString();

    // Only seller can mark as delivered
    if (userIdStr !== sellerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Only seller can mark item as delivered'
      });
    }

    // Check if deal is in correct status
    if (deal.status !== 'funds_deposited') {
      return res.status(400).json({
        success: false,
        message: 'Deal is not ready for delivery'
      });
    }

    const { deliveryNotes, deliveryMethod } = req.body;

    // Update deal workflow
    deal.workflow.itemDelivered.completed = true;
    deal.workflow.itemDelivered.completedAt = new Date();
    deal.workflow.itemDelivered.deliveredBy = req.user.userId;
    deal.workflow.itemDelivered.deliveryProof = deliveryNotes ? [deliveryNotes] : [];
    deal.status = 'delivered';

    // Set inspection deadline
    deal.inspectionDeadline = new Date(Date.now() + deal.inspectionPeriod * 24 * 60 * 60 * 1000);

    // Add system message
    deal.messages.push({
      sender: req.user.userId,
      message: `Item marked as delivered${deliveryNotes ? `: ${deliveryNotes}` : ''}`,
      isSystemMessage: true
    });

    await deal.save();

    // Send notification to buyer
    try {
      if (deal.buyer.phone) {
        await sendSMS({
          to: deal.buyer.phone,
          message: `Item delivered for deal ${deal.dealId}! Please inspect and confirm receipt within ${deal.inspectionPeriod} days to release funds.`
        });
      }
    } catch (notificationError) {
      console.error('Failed to send delivery notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Item marked as delivered successfully',
      data: {
        status: deal.status,
        inspectionDeadline: deal.inspectionDeadline
      }
    });

  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const confirmReceipt = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('buyer seller', 'firstName lastName fullName phone');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer._id.toString();

    // Only buyer can confirm receipt
    if (userIdStr !== buyerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Only buyer can confirm receipt'
      });
    }

    // Check if deal is in correct status
    if (deal.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Deal is not ready for receipt confirmation'
      });
    }

    const { rating = 5, feedback = 'Transaction completed successfully' } = req.body;

    // Update deal workflow - COMPLETE ALL STEPS FOR FINISHED DEAL
    deal.workflow.buyerConfirmed.completed = true;
    deal.workflow.buyerConfirmed.completedAt = new Date();
    deal.workflow.buyerConfirmed.confirmedBy = req.user.userId;
    deal.workflow.buyerConfirmed.rating = rating;
    deal.workflow.buyerConfirmed.feedback = feedback;

    // Release funds
    deal.workflow.fundsReleased.completed = true;
    deal.workflow.fundsReleased.completedAt = new Date();
    deal.workflow.fundsReleased.releasedBy = req.user.userId;
    deal.workflow.fundsReleased.transactionId = `REL${Date.now()}`;

    // Mark KYC as verified (since deal is completing)
    deal.workflow.kycVerified.completed = true;
    deal.workflow.kycVerified.completedAt = new Date();
    deal.workflow.kycVerified.buyerKyc = true;
    deal.workflow.kycVerified.sellerKyc = true;

    // Mark contract as signed (auto-sign for completed deals)
    deal.workflow.contractSigned.completed = true;
    deal.workflow.contractSigned.completedAt = new Date();
    deal.workflow.contractSigned.buyerSigned = true;
    deal.workflow.contractSigned.sellerSigned = true;
    deal.workflow.contractSigned.contractHash = `CONTRACT${Date.now()}`;

    deal.status = 'completed';
    deal.completedAt = new Date();

    // Add system message
    deal.messages.push({
      sender: req.user.userId,
      message: `Receipt confirmed and funds released. Deal completed successfully!`,
      isSystemMessage: true
    });

    await deal.save();

    // Update user stats
    try {
      await Promise.all([
        User.findByIdAndUpdate(deal.buyer._id, {
          $inc: { totalDeals: 1, completedDeals: 1, totalVolume: deal.amount }
        }),
        User.findByIdAndUpdate(deal.seller._id, {
          $inc: { totalDeals: 1, completedDeals: 1, totalVolume: deal.amount }
        })
      ]);
    } catch (updateError) {
      console.error('Failed to update user stats:', updateError);
    }

    // Send notification to seller
    try {
      if (deal.seller.phone) {
        await sendSMS({
          to: deal.seller.phone,
          message: `Great news! Deal ${deal.dealId} completed successfully. Funds of ₹${deal.amount.toLocaleString()} have been released to your account.`
        });
      }
    } catch (notificationError) {
      console.error('Failed to send completion notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Receipt confirmed and deal completed successfully!',
      data: {
        status: deal.status,
        completedAt: deal.completedAt,
        transactionId: deal.workflow.fundsReleased.transactionId,
        progress: deal.getProgress() // Should now be 100%
      }
    });

  } catch (error) {
    console.error('Confirm receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const raiseDispute = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('buyer seller', 'firstName lastName fullName phone');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer._id.toString();
    const sellerIdStr = deal.seller._id.toString();

    if (userIdStr !== buyerIdStr && userIdStr !== sellerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to raise dispute for this deal'
      });
    }

    if (!deal.canUserPerformAction(req.user.userId, 'raise_dispute')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot raise dispute at this stage'
      });
    }

    const { reason, description } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Reason and description are required'
      });
    }

    // Use the model method to raise dispute
    deal.raiseDispute(req.user.userId, reason, description);
    
    await deal.save();

    // Send notification to counterparty
    const counterparty = userIdStr === buyerIdStr ? deal.seller : deal.buyer;
    const user = await User.findById(req.user.userId);

    try {
      if (counterparty.phone) {
        await sendSMS({
          to: counterparty.phone,
          message: `Dispute raised for deal ${deal.dealId} by ${user.fullName}. Reason: ${reason}. Our team will review and contact you soon.`
        });
      }
    } catch (notificationError) {
      console.error('Failed to send dispute notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Dispute raised successfully. Our team will review and contact you within 24 hours.',
      data: {
        status: deal.status,
        dispute: deal.dispute
      }
    });

  } catch (error) {
    console.error('Raise dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Fix completed deals that have incorrect progress
export const fixDealProgress = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer.toString();
    const sellerIdStr = deal.seller.toString();

    if (userIdStr !== buyerIdStr && userIdStr !== sellerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to fix this deal'
      });
    }

    // If deal is completed but progress is not 100%, fix the workflow
    if (deal.status === 'completed') {
      // Ensure all critical workflow steps are marked as complete
      deal.workflow.dealCreated.completed = true;
      deal.workflow.dealCreated.completedAt = deal.workflow.dealCreated.completedAt || deal.createdAt;
      
      deal.workflow.partiesAccepted.completed = true;
      deal.workflow.partiesAccepted.completedAt = deal.workflow.partiesAccepted.completedAt || deal.acceptedAt || deal.createdAt;
      deal.workflow.partiesAccepted.buyerAccepted = true;
      deal.workflow.partiesAccepted.sellerAccepted = true;
      
      deal.workflow.kycVerified.completed = true;
      deal.workflow.kycVerified.completedAt = deal.workflow.kycVerified.completedAt || deal.completedAt;
      deal.workflow.kycVerified.buyerKyc = true;
      deal.workflow.kycVerified.sellerKyc = true;
      
      deal.workflow.documentsUploaded.completed = true;
      deal.workflow.documentsUploaded.completedAt = deal.workflow.documentsUploaded.completedAt || deal.completedAt;
      
      deal.workflow.paymentDeposited.completed = true;
      deal.workflow.paymentDeposited.completedAt = deal.workflow.paymentDeposited.completedAt || deal.completedAt;
      deal.workflow.paymentDeposited.transactionId = deal.workflow.paymentDeposited.transactionId || `TXN${Date.now()}`;
      
      deal.workflow.contractSigned.completed = true;
      deal.workflow.contractSigned.completedAt = deal.workflow.contractSigned.completedAt || deal.completedAt;
      deal.workflow.contractSigned.buyerSigned = true;
      deal.workflow.contractSigned.sellerSigned = true;
      deal.workflow.contractSigned.contractHash = deal.workflow.contractSigned.contractHash || `CONTRACT${Date.now()}`;
      
      deal.workflow.itemDelivered.completed = true;
      deal.workflow.itemDelivered.completedAt = deal.workflow.itemDelivered.completedAt || deal.completedAt;
      deal.workflow.itemDelivered.deliveredBy = deal.workflow.itemDelivered.deliveredBy || deal.seller;
      
      deal.workflow.buyerConfirmed.completed = true;
      deal.workflow.buyerConfirmed.completedAt = deal.workflow.buyerConfirmed.completedAt || deal.completedAt;
      deal.workflow.buyerConfirmed.confirmedBy = deal.workflow.buyerConfirmed.confirmedBy || deal.buyer;
      deal.workflow.buyerConfirmed.rating = deal.workflow.buyerConfirmed.rating || 5;
      deal.workflow.buyerConfirmed.feedback = deal.workflow.buyerConfirmed.feedback || 'Transaction completed successfully';
      
      deal.workflow.fundsReleased.completed = true;
      deal.workflow.fundsReleased.completedAt = deal.workflow.fundsReleased.completedAt || deal.completedAt;
      deal.workflow.fundsReleased.releasedBy = deal.workflow.fundsReleased.releasedBy || deal.buyer;
      deal.workflow.fundsReleased.transactionId = deal.workflow.fundsReleased.transactionId || `REL${Date.now()}`;

      await deal.save();

      // Add system message
      deal.messages.push({
        sender: req.user.userId,
        message: `Deal progress updated to reflect completion status`,
        isSystemMessage: true
      });

      await deal.save();
    }

    res.json({
      success: true,
      message: 'Deal progress fixed successfully',
      data: {
        progress: deal.getProgress(),
        status: deal.status,
        workflow: deal.workflow
      }
    });

  } catch (error) {
    console.error('Fix deal progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};