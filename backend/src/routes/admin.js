import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  getDashboardData,
  getFlaggedDeals,
  getKYCReviews,
  reviewKYC,
  reviewDeal
} from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/dashboard', getDashboardData);
router.get('/flagged-deals', getFlaggedDeals);
router.get('/kyc-reviews', getKYCReviews);
router.post('/kyc/:kycId/:action', reviewKYC);
router.post('/deals/:dealId/:action', reviewDeal);

export default router;