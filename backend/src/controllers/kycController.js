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
    let kyc = await KYC.findOne({ user: req.user.userId });
    
    if (!kyc) {
      kyc = new KYC({
        user: req.user.userId,
        kycType: 'personal',
        status: 'pending'
      });
    }

    kyc.personalInfo = { ...kyc.personalInfo, ...req.body };
    kyc.status = 'in_progress';
    
    await kyc.save();

    res.json({
      success: true,
      message: 'Personal information updated successfully'
    });

  } catch (error) {
    console.error('Update personal info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateBusinessInfo = async (req, res) => {
  try {
    let kyc = await KYC.findOne({ user: req.user.userId });
    
    if (!kyc) {
      kyc = new KYC({
        user: req.user.userId,
        kycType: 'business',
        status: 'pending'
      });
    }

    kyc.businessInfo = { ...kyc.businessInfo, ...req.body };
    kyc.kycType = 'business';
    kyc.status = 'in_progress';
    
    await kyc.save();

    res.json({
      success: true,
      message: 'Business information updated successfully'
    });

  } catch (error) {
    console.error('Update business info error:', error);
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