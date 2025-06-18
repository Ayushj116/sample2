import express from 'express';
import { body, param } from 'express-validator';
import { handleMulterError } from '../middleware/upload.js';
import {
  createDeal,
  getDeals,
  getDeal,
  acceptDeal,
  addMessage,
  cancelDeal,
  sendKYCReminder,
  uploadDealDocument,
  depositPayment,
  markDelivered,
  confirmReceipt,
  raiseDispute,
  fixDealProgress
} from '../controllers/dealController.js';

const router = express.Router();

const createDealValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be 5-200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be 10-2000 characters'),
  body('category')
    .isIn(['vehicle', 'real_estate', 'domain', 'freelancing', 'other'])
    .withMessage('Invalid category'),
  body('amount')
    .isFloat({ min: 1000, max: 100000000 })
    .withMessage('Amount must be between ₹1,000 and ₹10 crores'),
  body('deliveryMethod')
    .isIn(['in_person', 'courier', 'digital', 'other'])
    .withMessage('Invalid delivery method'),
  body('inspectionPeriod')
    .isInt({ min: 1, max: 30 })
    .withMessage('Inspection period must be 1-30 days'),
  body('additionalTerms')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Additional terms must be 1000 characters or less'),
  body('buyerPhone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid buyer phone'),
  body('sellerPhone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid seller phone'),
  body('userRole')
    .isIn(['buyer', 'seller'])
    .withMessage('User role must be buyer or seller')
];

const addMessageValidation = [
  param('id').isMongoId(),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters')
];

const depositPaymentValidation = [
  param('id').isMongoId(),
  body('paymentMethod').optional().isString(),
  body('transactionId').optional().isString()
];

const markDeliveredValidation = [
  param('id').isMongoId(),
  body('deliveryNotes').optional().isString(),
  body('deliveryMethod').optional().isString()
];

const confirmReceiptValidation = [
  param('id').isMongoId(),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('feedback').optional().isString()
];

const raiseDisputeValidation = [
  param('id').isMongoId(),
  body('reason').trim().isLength({ min: 5, max: 100 }).withMessage('Reason must be 5-100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters')
];

// Apply multer error handling to document upload routes
router.use('/:id/documents', handleMulterError);

router.post('/', createDealValidation, createDeal);
router.get('/', getDeals);
router.get('/:id', param('id').isMongoId(), getDeal);
router.post('/:id/accept', param('id').isMongoId(), acceptDeal);
router.post('/:id/messages', addMessageValidation, addMessage);
router.post('/:id/cancel', param('id').isMongoId(), cancelDeal);
router.post('/:id/send-kyc-reminder', param('id').isMongoId(), sendKYCReminder);
router.post('/:id/documents', param('id').isMongoId(), uploadDealDocument);
router.post('/:id/deposit-payment', depositPaymentValidation, depositPayment);
router.post('/:id/mark-delivered', markDeliveredValidation, markDelivered);
router.post('/:id/confirm-receipt', confirmReceiptValidation, confirmReceipt);
router.post('/:id/raise-dispute', raiseDisputeValidation, raiseDispute);
router.post('/:id/fix-progress', param('id').isMongoId(), fixDealProgress);

export default router;