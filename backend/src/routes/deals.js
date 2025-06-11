import express from 'express';
import { body, param } from 'express-validator';
import {
  createDeal,
  getDeals,
  getDeal,
  acceptDeal,
  addMessage,
  cancelDeal
} from '../controllers/dealController.js';

const router = express.Router();

const createDealValidation = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  body('category').isIn(['vehicle', 'real_estate', 'domain', 'freelancing', 'other']).withMessage('Invalid category'),
  body('amount').isFloat({ min: 1000, max: 100000000 }).withMessage('Amount must be between ₹1,000 and ₹10 crores'),
  body('deliveryMethod').isIn(['in_person', 'courier', 'digital', 'other']).withMessage('Invalid delivery method'),
  body('inspectionPeriod').isInt({ min: 1, max: 30 }).withMessage('Inspection period must be 1-30 days'),
  body('buyerPhone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid buyer phone'),
  body('sellerPhone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid seller phone')
];

const addMessageValidation = [
  param('id').isMongoId(),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters')
];

router.post('/', createDealValidation, createDeal);
router.get('/', getDeals);
router.get('/:id', param('id').isMongoId(), getDeal);
router.post('/:id/accept', param('id').isMongoId(), acceptDeal);
router.post('/:id/messages', addMessageValidation, addMessage);
router.post('/:id/cancel', param('id').isMongoId(), cancelDeal);

export default router;