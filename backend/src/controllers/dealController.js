import { body, validationResult, param } from 'express-validator';
import Deal from '../models/Deal.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
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
      buyerEmail,
      sellerEmail,
      buyerPhone,
      sellerPhone,
      buyerName,
      sellerName,
      userRole
    } = req.body;

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
      
      if (sellerEmail) {
        seller = await User.findOne({ email: sellerEmail });
        if (!seller) {
          seller = new User({
            firstName: sellerName?.split(' ')[0] || 'Seller',
            lastName: sellerName?.split(' ').slice(1).join(' ') || 'User',
            email: sellerEmail,
            phone: sellerPhone || '0000000000',
            password: Math.random().toString(36).slice(-8),
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
      
      if (buyerEmail) {
        buyer = await User.findOne({ email: buyerEmail });
        if (!buyer) {
          buyer = new User({
            firstName: buyerName?.split(' ')[0] || 'Buyer',
            lastName: buyerName?.split(' ').slice(1).join(' ') || 'User',
            email: buyerEmail,
            phone: buyerPhone || '0000000000',
            password: Math.random().toString(36).slice(-8),
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

    const deal = new Deal({
      title,
      description,
      category,
      subcategory,
      amount,
      escrowFee: feeCalculation.baseFee,
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

    await deal.populate(['buyer', 'seller', 'initiatedBy']);

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
        message: 'Not authorized to accept this deal'
      });
    }

    const userIdStr = req.user.userId;
    const buyerIdStr = deal.buyer._id.toString();
    const sellerIdStr = deal.seller._id.toString();
    const isBuyer = userIdStr === buyerIdStr;

    if (isBuyer) {
      deal.workflow.partiesAccepted.buyerAccepted = true;
      deal.workflow.partiesAccepted.buyerAcceptedAt = new Date();
    } else {
      deal.workflow.partiesAccepted.sellerAccepted = true;
      deal.workflow.partiesAccepted.sellerAcceptedAt = new Date();
    }

    if (deal.workflow.partiesAccepted.buyerAccepted && deal.workflow.partiesAccepted.sellerAccepted) {
      deal.workflow.partiesAccepted.completed = true;
      deal.workflow.partiesAccepted.completedAt = new Date();
      deal.status = 'accepted';
      deal.acceptedAt = new Date();
    }

    deal.messages.push({
      sender: req.user.userId,
      message: `${isBuyer ? 'Buyer' : 'Seller'} has accepted the deal`,
      isSystemMessage: true
    });

    await deal.save();

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