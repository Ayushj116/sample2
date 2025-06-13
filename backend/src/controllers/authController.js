import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { sendSMS } from '../services/smsService.js';
import { sendEmail } from '../services/emailService.js';

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res) => {
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
      firstName,
      lastName,
      phone,
      password,
      userType,
      businessName,
      businessType,
      gstin
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      // If user is system-generated, update their details
      if (existingUser.isSystemGenerated) {
        // Update the system-generated user with provided details
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        existingUser.password = password; // This will be hashed by pre-save middleware
        existingUser.userType = userType;
        existingUser.isSystemGenerated = false;
        existingUser.phoneVerified = true;
        
        if (userType === 'business') {
          if (!businessName) {
            return res.status(400).json({
              success: false,
              message: 'Business name is required for business accounts'
            });
          }
          existingUser.businessName = businessName;
          existingUser.businessType = businessType;
          existingUser.gstin = gstin;
        }

        await existingUser.save();

        const token = generateToken(existingUser._id);

        try {
          await sendSMS({
            to: phone,
            message: `Welcome to Safe Transfer! Your account has been activated successfully. Start your secure transactions today.`
          });
        } catch (smsError) {
          console.error('Failed to send welcome SMS:', smsError);
        }

        return res.status(200).json({
          success: true,
          message: 'Account activated successfully',
          data: {
            user: existingUser.getPublicProfile(),
            token
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this phone number'
        });
      }
    }

    // Create new user
    const userData = {
      firstName,
      lastName,
      phone,
      password,
      userType,
      isSystemGenerated: false
    };

    if (userType === 'business') {
      if (!businessName) {
        return res.status(400).json({
          success: false,
          message: 'Business name is required for business accounts'
        });
      }
      userData.businessName = businessName;
      userData.businessType = businessType;
      userData.gstin = gstin;
    }

    const user = new User(userData);
    await user.save();

    // For demo purposes, mark as verified
    user.phoneVerified = true;
    await user.save();

    const token = generateToken(user._id);

    try {
      await sendSMS({
        to: phone,
        message: `Welcome to Safe Transfer! Your account has been created successfully. Start your first secure transaction today.`
      });
    } catch (smsError) {
      console.error('Failed to send welcome SMS:', smsError);
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is system-generated
    if (user.isSystemGenerated) {
      return res.status(401).json({
        success: false,
        message: 'Please complete your account registration first',
        requiresRegistration: true
      });
    }

    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const verifyPhone = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.phoneVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Phone verified successfully'
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with this phone number exists, you will receive an OTP'
      });
    }

    // Check if user is system-generated
    if (user.isSystemGenerated) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your account registration first',
        requiresRegistration: true
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const otp = generateOTP();

    try {
      await sendSMS({
        to: phone,
        message: `Your Safe Transfer password reset OTP is: ${otp}. This OTP will expire in 10 minutes. Do not share this with anyone.`
      });

      // In production, you would store the OTP in database or cache
      // For demo, we'll return it in response (remove in production)
      res.json({
        success: true,
        message: 'Password reset OTP sent to your phone',
        data: {
          resetToken,
          otp // Remove this in production
        }
      });
    } catch (smsError) {
      console.error('Failed to send password reset SMS:', smsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset OTP'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, otp, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const newToken = generateToken(decoded.userId);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const checkUserExists = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Valid phone number is required'
      });
    }

    const user = await User.findOne({ phone });

    res.json({
      success: true,
      data: {
        exists: !!user,
        isSystemGenerated: user ? user.isSystemGenerated : false,
        requiresRegistration: user ? user.isSystemGenerated : true
      }
    });

  } catch (error) {
    console.error('Check user exists error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};