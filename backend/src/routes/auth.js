import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyPhone,
  forgotPassword,
  resetPassword,
  refreshToken
} from '../controllers/authController.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.'
});

const registerValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian mobile number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('userType').isIn(['personal', 'business']).withMessage('User type must be personal or business'),
  body('businessName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters')
];

const loginValidation = [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian mobile number'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/verify-phone', verifyPhone);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

export default router;