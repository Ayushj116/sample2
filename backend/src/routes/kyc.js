import express from 'express';
import { handleMulterError } from '../middleware/upload.js';
import {
  getKYCStatus,
  uploadDocument,
  updatePersonalInfo,
  updateBusinessInfo,
  submitKYC
} from '../controllers/kycController.js';

const router = express.Router();

// Apply multer error handling to all routes
router.use(handleMulterError);

router.get('/status', getKYCStatus);
router.post('/upload', uploadDocument);
router.put('/personal-info', updatePersonalInfo);
router.put('/business-info', updateBusinessInfo);
router.post('/submit', submitKYC);

export default router;