import { api } from './api';

export interface KYCStatus {
  personal: 'pending' | 'in_progress' | 'approved' | 'rejected';
  business: 'pending' | 'in_progress' | 'approved' | 'rejected';
}

export interface KYCDocument {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  verified: boolean;
  verificationNotes?: string;
}

export interface KYCData {
  user: string;
  kycType: 'personal' | 'business';
  kycLevel: 'basic' | 'intermediate' | 'advanced';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  documents: {
    panCard?: KYCDocument;
    aadhaarFront?: KYCDocument;
    aadhaarBack?: KYCDocument;
    bankStatement?: KYCDocument;
    addressProof?: KYCDocument;
    businessRegistration?: KYCDocument;
    gstCertificate?: KYCDocument;
    businessBankStatement?: KYCDocument;
    authorizedSignatoryId?: KYCDocument;
  };
  personalInfo?: {
    panNumber?: string;
    aadhaarNumber?: string;
    currentAddress?: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      pincode: string;
    };
    bankAccount?: {
      accountNumber: string;
      ifscCode: string;
      bankName: string;
      accountHolderName: string;
      accountType: 'savings' | 'current';
    };
  };
  businessInfo?: {
    businessName?: string;
    businessType?: string;
    registrationNumber?: string;
    gstin?: string;
    businessAddress?: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export const kycService = {
  async getKYCStatus(): Promise<{ success: boolean; data: KYCData }> {
    return api.get('/kyc/status');
  },

  async uploadDocument(documentType: string, file: File): Promise<{ success: boolean; message: string; data: any }> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${apiUrl}/kyc/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
  },

  async submitKYC(kycData: Partial<KYCData>): Promise<{ success: boolean; message: string }> {
    return api.post('/kyc/submit', kycData);
  },

  async updatePersonalInfo(personalInfo: any): Promise<{ success: boolean; message: string }> {
    return api.put('/kyc/personal-info', personalInfo);
  },

  async updateBusinessInfo(businessInfo: any): Promise<{ success: boolean; message: string }> {
    return api.put('/kyc/business-info', businessInfo);
  }
};