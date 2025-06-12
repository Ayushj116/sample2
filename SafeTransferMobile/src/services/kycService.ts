import { api } from './api';
import { KYCData } from '@/types';

export const kycService = {
  async getKYCStatus(): Promise<{ success: boolean; data: KYCData }> {
    return api.get('/kyc/status');
  },

  async uploadDocument(documentType: string, file: any): Promise<{ success: boolean; message: string; data: any }> {
    const formData = new FormData();
    formData.append('document', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
    formData.append('documentType', documentType);

    return api.upload('/kyc/upload', formData);
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