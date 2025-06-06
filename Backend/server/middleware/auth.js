import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked'
      });
    }

    // Add user to request object
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType,
      isAdmin: user.isAdmin,
      kycStatus: user.kycStatus
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

export const requireKYC = (level = 'basic') => {
  return (req, res, next) => {
    const kycLevels = ['basic', 'intermediate', 'advanced'];
    const userLevel = req.user.kycStatus === 'approved' ? 'basic' : 'none';
    const requiredLevelIndex = kycLevels.indexOf(level);
    const userLevelIndex = kycLevels.indexOf(userLevel);

    if (userLevelIndex < requiredLevelIndex) {
      return res.status(403).json({
        success: false,
        message: `KYC ${level} verification required`,
        requiredKycLevel: level,
        currentKycLevel: userLevel
      });
    }
    next();
  };
};