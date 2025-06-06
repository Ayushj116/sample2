import express from 'express';
import { body, validationResult, param } from 'express-validator';
import Deal from '../models/Deal.js';
import User from '../models/User.js';
import KYC from '../models/KYC.js';
import { sendEmail } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';
import { calculateEscrowFee } from '../utils/feeCalculator.js';

const router = express.Router();

// Validation rules
const createDealValidation = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  body('category').isIn(['vehicle', 'real_estate', 'domain', 'freelancing', 'other']).withMessage('Invalid category'),
  body('amount').isFloat({ min: 1000, max: 100000000 }).withMessage('Amount must be between ₹1,000 and ₹10 crores'),
  body('deliveryMethod').isIn(['in_person', 'courier', 'digital', 'other']).withMessage('Invalid delivery method'),
  body('inspectionPeriod').isInt({ min: 1, max: 30 }).withMessage('Inspection period must be 1-30 days'),
  body('buyerEmail').optional().isEmail().withMessage('Invalid buyer email'),
  body('sellerEmail').optional().isEmail().withMessage('Invalid seller email'),
  body('buyerPhone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid buyer phone'),
  body('sellerPhone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid seller phone')
];

// Create new deal
router.post('/', createDealValidation, async (req, res) => {
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
      buyerEmail,
      sellerEmail,
      buyerPhone,
      sellerPhone,
      buyerName,
      sellerName,
      userRole // 'buyer' or 'seller'
    } = req.body;

    const initiator = await User.findById(req.user.userId);
    if (!initiator) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate escrow fee
    const feeCalculation = calculateEscrowFee(amount, initiator.userType);

    // Determine buyer and seller
    let buyer, seller;
    
    if (userRole === 'buyer') {
      buyer = initiator._id;
      
      // Find or create seller
      if (sellerEmail) {
        seller = await User.findOne({ email: sellerEmail });
        if (!seller) {
          // Create placeholder seller account
          seller = new User({
            firstName: sellerName?.split(' ')[0] || 'Seller',
            lastName: sellerName?.split(' ').slice(1).join(' ') || 'User',
            email: sellerEmail,
            phone: sellerPhone || '0000000000',
            password: Math.random().toString(36).slice(-8), // Temporary password
            userType: 'personal',
            emailVerified: false,
            phoneVerified: false
          });
          await seller.save();
        }
        seller = seller._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Seller email is required'
        });
      }
    } else {
      seller = initiator._id;
      
      // Find or create buyer
      if (buyerEmail) {
        buyer = await User.findOne({ email: buyerEmail });
        if (!buyer) {
          // Create placeholder buyer account
          buyer = new User({
            firstName: buyerName?.split(' ')[0] || 'Buyer',
            lastName: buyerName?.split(' ').slice(1).join(' ') || 'User',
            email: buyerEmail,
            phone: buyerPhone || '0000000000',
            password: Math.random().toString(36).slice(-8), // Temporary password
            userType: 'personal',
            emailVerified: false,
            phoneVerified: false
          });
          await buyer.save();
        }
        buyer = buyer._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Buyer email is required'
        });
      }
    }

    // Create deal
    const deal = new Deal({
      title,
      description,
      category,
      subcategory,
      amount,
      escrowFee: feeCalculation.fee,
      escrowFeePercentage: feeCalculation.percentage,
      deliveryMethod,
      inspectionPeriod,
      additionalTerms,
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

    // Populate deal with user details
    await deal.populate(['buyer', 'seller', 'initiatedBy']);

    // Send notifications to counterparty
    const counterparty = userRole === 'buyer' ? deal.seller : deal.buyer;
    
    try {
      await sendEmail({
        to: counterparty.email,
        subject: 'New Escrow Deal Invitation - Safe Transfer',
        template: 'deal_invitation',
        data: {
          dealId: deal.dealId,
          title: deal.title,
          amount: deal.amount,
          initiatorName: initiator.fullName,
          role: userRole === 'buyer' ? 'seller' : 'buyer',
          dealLink: `${process.env.FRONTEND_URL}/deal/${deal._id}`
        }
      });

      if (counterparty.phone && counterparty.phone !== '0000000000') {
        await sendSMS({
          to: counterparty.phone,
          message: `New escrow deal invitation from ${initiator.fullName} for ₹${amount.toLocaleString()}. Deal ID: ${deal.dealId}. Login to Safe Transfer to view details.`
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
          nextAction: deal.getNextAction(req.user.userId),
          progress: deal.getProgress(),
          createdAt: deal.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's deals
router.get('/', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    
    const query = {
      $or: [
        { buyer: req.user.userId },
        { seller: req.user.userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const deals = await Deal.find(query)
      .populate('buyer', 'firstName lastName fullName avatar userType rating')
      .populate('seller', 'firstName lastName fullName avatar userType rating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Deal.countDocuments(query);

    const dealsWithActions = deals.map(deal => ({
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
      nextAction: deal.getNextAction(req.user.userId),
      progress: deal.getProgress(),
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt
    }));

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
});

// Get deal by ID
router.get('/:id', param('id').isMongoId(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal ID'
      });
    }

    const deal = await Deal.findById(req.params.id)
      .populate('buyer', 'firstName lastName fullName avatar userType rating totalDeals completedDeals')
      .populate('seller', 'firstName lastName fullName avatar userType rating totalDeals completedDeals')
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

    // Check if user is authorized to view this deal
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
          nextAction: deal.getNextAction(req.user.userId),
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
});

// Accept deal
router.post('/:id/accept', param('id').isMongoId(), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('buyer seller');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check authorization
    if (!deal.canUserPerformAction(req.user.userId, 'accept_deal')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this deal'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer._id.toString();
    const sellerIdStr = deal.seller._id.toString();
    const isBuyer = userIdStr === buyerIdStr;

    // Update workflow
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
      await sendEmail({
        to: counterparty.email,
        subject: 'Deal Accepted - Safe Transfer',
        template: 'deal_accepted',
        data: {
          dealId: deal.dealId,
          title: deal.title,
          acceptedBy: user.fullName,
          dealLink: `${process.env.FRONTEND_URL}/deal/${deal._id}`
        }
      });
    } catch (notificationError) {
      console.error('Failed to send acceptance notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Deal accepted successfully',
      data: {
        status: deal.status,
        nextAction: deal.getNextAction(req.user.userId),
        progress: deal.getProgress()
      }
    });

  } catch (error) {
    console.error('Accept deal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add message to deal
router.post('/:id/messages', [
  param('id').isMongoId(),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters')
], async (req, res) => {
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

    // Check authorization
    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer.toString();
    const sellerIdStr = deal.seller.toString();

    if (userIdStr !== buyerIdStr && userIdStr !== sellerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to message in this deal'
      });
    }

    // Add message
    deal.messages.push({
      sender: req.user.userId,
      message: req.body.message
    });

    await deal.save();

    // Populate the new message
    await deal.populate('messages.sender', 'firstName lastName fullName avatar');
    const newMessage = deal.messages[deal.messages.length - 1];

    // Send notification to counterparty
    const counterparty = userIdStr === buyerIdStr ? deal.seller : deal.buyer;
    const counterpartyUser = await User.findById(counterparty);
    const sender = await User.findById(req.user.userId);

    try {
      await sendEmail({
        to: counterpartyUser.email,
        subject: 'New Message - Safe Transfer',
        template: 'new_message',
        data: {
          dealId: deal.dealId,
          title: deal.title,
          senderName: sender.fullName,
          message: req.body.message,
          dealLink: `${process.env.FRONTEND_URL}/deal/${deal._id}`
        }
      });
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
});

// Cancel deal
router.post('/:id/cancel', [
  param('id').isMongoId(),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be max 500 characters')
], async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check authorization
    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer.toString();
    const sellerIdStr = deal.seller.toString();

    if (userIdStr !== buyerIdStr && userIdStr !== sellerIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this deal'
      });
    }

    // Check if deal can be cancelled
    if (!['created', 'accepted', 'kyc_pending', 'documents_pending'].includes(deal.status)) {
      return res.status(400).json({
        success: false,
        message: 'Deal cannot be cancelled at this stage'
      });
    }

    deal.status = 'cancelled';
    
    // Add system message
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
});

export default router;