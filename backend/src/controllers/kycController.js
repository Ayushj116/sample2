import KYC from '../models/KYC.js';
import User from '../models/User.js';
import upload from '../middleware/upload.js';

export const getKYCStatus = async (req, res) => {
  try {
    let kyc = await KYC.findOne({ user: req.user.userId });
    
    if (!kyc) {
      kyc = new KYC({
        user: req.user.userId,
        kycType: 'personal',
        status: 'pending'
      });
      await kyc.save();
    }

    res.json({
      success: true,
      data: kyc
    });

  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    upload.single('document')(req, res, async (err) => {
      if (err) {
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
      
      if (!documentType) {
        return res.status(400).json({
          success: false,
          message: 'Document type is required'
        });
      }

      let kyc = await KYC.findOne({ user: req.user.userId });
      
      if (!kyc) {
        kyc = new KYC({
          user: req.user.userId,
          kycType: 'personal',
          status: 'pending'
        });
      }

      const documentData = {
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        uploadedAt: new Date(),
        verified: false
      };

      kyc.documents[documentType] = documentData;
      kyc.status = 'in_progress';
      
      await kyc.save();

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          fileName: req.file.originalname,
          fileUrl: `/uploads/${req.file.filename}`,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        }
      });
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updatePersonalInfo = async (req, res) => {
  try {
    const {
      panNumber,
      aadhaarNumber,
      currentAddress,
      bankAccount
    } = req.body;

    // Validate required fields
    const errors = [];
    
    if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      errors.push({ field: 'panNumber', message: 'Invalid PAN number format' });
    }
    
    if (aadhaarNumber && !/^[0-9]{12}$/.test(aadhaarNumber.replace(/\s/g, ''))) {
      errors.push({ field: 'aadhaarNumber', message: 'Invalid Aadhaar number format' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    let kyc = await KYC.findOne({ user: req.user.userId });
    
    if (!kyc) {
      kyc = new KYC({
        user: req.user.userId,
        kycType: 'personal',
        status: 'pending'
      });
    }

    // Ensure personalInfo exists
    if (!kyc.personalInfo) {
      kyc.personalInfo = {};
    }

    // Update only provided fields
    if (panNumber !== undefined) kyc.personalInfo.panNumber = panNumber;
    if (aadhaarNumber !== undefined) kyc.personalInfo.aadhaarNumber = aadhaarNumber;
    
    if (currentAddress) {
      if (!kyc.personalInfo.currentAddress) {
        kyc.personalInfo.currentAddress = {};
      }
      Object.assign(kyc.personalInfo.currentAddress, currentAddress);
    }
    
    if (bankAccount) {
      if (!kyc.personalInfo.bankAccount) {
        kyc.personalInfo.bankAccount = {};
      }
      Object.assign(kyc.personalInfo.bankAccount, bankAccount);
    }

    kyc.status = 'in_progress';
    kyc.markModified('personalInfo'); // Ensure Mongoose detects the change
    
    await kyc.save();

    res.json({
      success: true,
      message: 'Personal information updated successfully',
      data: kyc
    });

  } catch (error) {
    console.error('Update personal info error:', error);
    
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
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateBusinessInfo = async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      registrationNumber,
      gstin,
      businessAddress
    } = req.body;

    // Validate GSTIN format if provided
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'gstin', message: 'Invalid GSTIN format' }]
      });
    }

    let kyc = await KYC.findOne({ user: req.user.userId });
    
    if (!kyc) {
      kyc = new KYC({
        user: req.user.userId,
        kycType: 'business',
        status: 'pending'
      });
    }

    // Ensure businessInfo exists
    if (!kyc.businessInfo) {
      kyc.businessInfo = {};
    }

    // Update only provided fields
    if (businessName !== undefined) kyc.businessInfo.businessName = businessName;
    if (businessType !== undefined) kyc.businessInfo.businessType = businessType;
    if (registrationNumber !== undefined) kyc.businessInfo.registrationNumber = registrationNumber;
    if (gstin !== undefined) kyc.businessInfo.gstin = gstin;
    
    if (businessAddress) {
      if (!kyc.businessInfo.businessAddress) {
        kyc.businessInfo.businessAddress = {};
      }
      Object.assign(kyc.businessInfo.businessAddress, businessAddress);
    }

    kyc.kycType = 'business';
    kyc.status = 'in_progress';
    kyc.markModified('businessInfo'); // Ensure Mongoose detects the change
    
    await kyc.save();

    res.json({
      success: true,
      message: 'Business information updated successfully',
      data: kyc
    });

  } catch (error) {
    console.error('Update business info error:', error);
    
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
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const submitKYC = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user.userId });
    
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC record not found'
      });
    }

    if (!kyc.isComplete()) {
      return res.status(400).json({
        success: false,
        message: 'KYC information is incomplete'
      });
    }

    kyc.status = 'in_progress';
    kyc.verification.submittedAt = new Date();
    
    kyc.addAuditEntry(
      'KYC submitted for review',
      req.user.userId,
      'User submitted KYC for verification',
      req.ip
    );
    
    await kyc.save();

    // Update user KYC status
    await User.findByIdAndUpdate(req.user.userId, {
      kycStatus: 'in_progress'
    });

    res.json({
      success: true,
      message: 'KYC submitted for verification successfully'
    });

  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};