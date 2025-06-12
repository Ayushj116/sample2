import { api } from './api';
import { Deal, CreateDealRequest } from '@/types';

export interface DealsResponse {
  success: boolean;
  data: {
    deals: Deal[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface DealResponse {
  success: boolean;
  data: {
    deal: Deal;
  };
}

export const dealService = {
  async createDeal(dealData: CreateDealRequest): Promise<DealResponse> {
    return api.post('/deals', dealData);
  },

  async getDeals(params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<DealsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return api.get(`/deals${queryString ? `?${queryString}` : ''}`);
  },

  async getDeal(id: string): Promise<DealResponse> {
    return api.get(`/deals/${id}`);
  },

  async acceptDeal(id: string): Promise<{ success: boolean; message: string; data: any }> {
    return api.post(`/deals/${id}/accept`);
  },

  async addMessage(id: string, message: string): Promise<{ success: boolean; message: string; data: any }> {
    return api.post(`/deals/${id}/messages`, { message });
  },

  async cancelDeal(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/deals/${id}/cancel`, { reason });
  },

  async uploadDocument(dealId: string, documentType: string, file: any): Promise<{ success: boolean; message: string; data: any }> {
    const formData = new FormData();
    formData.append('document', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
    formData.append('documentType', documentType);

    return api.upload(`/deals/${dealId}/documents`, formData);
  }
};