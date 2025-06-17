import KYC from '../models/KYC.js';
import User from '../models/User.js';
import upload from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // Use multer middleware
    upload.single('document')(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
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
        // Clean up uploaded file if documentType is missing
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
          }
        }
        
        return res.status(400).json({
          success: false,
          message: 'Document type is required'
        });
      }

      // Validate document type
      const validDocumentTypes = [
        'panCard', 'aadhaarFront', 'aadhaarBack', 'bankStatement', 
        'addressProof', 'businessRegistration', 'gstCertificate', 
        'businessBankStatement', 'authorizedSignatoryId'
      ];

      if (!validDocumentTypes.includes(documentType)) {
        // Clean up uploaded file
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
          }
        }
        
        return res.status(400).json({
          success: false,
          message: 'Invalid document type'
        });
      }

      try {
        let kyc = await KYC.findOne({ user: req.user.userId });
        
        if (!kyc) {
          kyc = new KYC({
            user: req.user.userId,
            kycType: 'personal',
            status: 'pending'
          });
        }

        // If there's an existing document, remove the old file
        if (kyc.documents && kyc.documents[documentType] && kyc.documents[documentType].fileUrl) {
          const oldFilePath = path.join(__dirname, '../../uploads', path.basename(kyc.documents[documentType].fileUrl));
          try {
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
          } catch (cleanupError) {
            console.error('Error removing old file:', cleanupError);
          }
        }

        const documentData = {
          fileName: req.file.originalname,
          fileUrl: `/uploads/${req.file.filename}`,
          uploadedAt: new Date(),
          verified: false
        };

        // Initialize documents object if it doesn't exist
        if (!kyc.documents) {
          kyc.documents = {};
        }

        kyc.documents[documentType] = documentData;
        kyc.status = 'in_progress';
        
        // Add audit entry
        kyc.addAuditEntry(
          `Document uploaded: ${documentType}`,
          req.user.userId,
          `File: ${req.file.originalname}`,
          req.ip
        );
        
        await kyc.save();

        res.json({
          success: true,
          message: 'Document uploaded successfully',
          data: {
            fileName: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            documentType: documentType
          }
        });

      } catch (dbError) {
        console.error('Database error during document upload:', dbError);
        
        // Clean up uploaded file on database error
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error('Error cleaning up file after DB error:', cleanupError);
          }
        }
        
        res.status(500).json({
          success: false,
          message: 'Failed to save document information'
        });
      }
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
    
    // Add audit entry
    kyc.addAuditEntry(
      'Personal information updated',
      req.user.userId,
      'Personal info form updated',
      req.ip
    );
    
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
    
    // Add audit entry
    kyc.addAuditEntry(
      'Business information updated',
      req.user.userId,
      'Business info form updated',
      req.ip
    );
    
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

    // Check if minimum requirements are met
    const hasBasicInfo = kyc.personalInfo?.panNumber && kyc.personalInfo?.aadhaarNumber;
    const hasRequiredDocs = kyc.documents?.panCard?.fileUrl && 
                           kyc.documents?.aadhaarFront?.fileUrl;

    if (!hasBasicInfo || !hasRequiredDocs) {
      return res.status(400).json({
        success: false,
        message: 'Please complete basic information and upload required documents before submitting'
      });
    }

    // For demo purposes, auto-approve KYC
    kyc.status = 'approved';
    kyc.verification.submittedAt = new Date();
    kyc.verification.approvedAt = new Date();
    kyc.verification.expiryDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000); // 2 years
    
    kyc.addAuditEntry(
      'KYC submitted and auto-approved',
      req.user.userId,
      'KYC automatically approved for demo purposes',
      req.ip
    );
    
    await kyc.save();

    // Update user KYC status
    await User.findByIdAndUpdate(req.user.userId, {
      kycStatus: 'approved'
    });

    res.json({
      success: true,
      message: 'KYC submitted and approved successfully'
    });

  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};