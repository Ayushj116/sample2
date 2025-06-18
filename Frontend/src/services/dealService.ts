import { api } from './api';

export interface Deal {
  id: string;
  dealId: string;
  title: string;
  description: string;
  category: 'vehicle' | 'real_estate' | 'domain' | 'freelancing' | 'other';
  subcategory?: string;
  amount: number;
  escrowFee: number;
  escrowFeePercentage: number;
  deliveryMethod: 'in_person' | 'courier' | 'digital' | 'other';
  inspectionPeriod: number;
  additionalTerms?: string;
  status: string;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
    userType: string;
    rating: {
      average: number;
      count: number;
    };
  };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
    userType: string;
    rating: {
      average: number;
      count: number;
    };
  };
  role?: 'buyer' | 'seller';
  workflow: any;
  messages: any[];
  documents: any[];
  dispute: any;
  nextAction: string;
  progress: number;
  canPerformActions: {
    acceptDeal: boolean;
    depositPayment: boolean;
    signContract: boolean;
    markDelivered: boolean;
    confirmReceipt: boolean;
    raiseDispute: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealRequest {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  amount: number;
  deliveryMethod: string;
  inspectionPeriod: number;
  additionalTerms?: string;
  buyerPhone?: string;
  sellerPhone?: string;
  buyerName?: string;
  sellerName?: string;
  userRole: 'buyer' | 'seller';
}

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
    try {
      const response = await api.post(`/deals/${id}/accept`);
      return response;
    } catch (error) {
      console.error('Accept deal error:', error);
      throw error;
    }
  },

  async addMessage(id: string, message: string): Promise<{ success: boolean; message: string; data: any }> {
    return api.post(`/deals/${id}/messages`, { message });
  },

  async cancelDeal(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/deals/${id}/cancel`, { reason });
  },

  async sendKYCReminder(id: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/deals/${id}/send-kyc-reminder`);
  },

  async depositPayment(id: string, paymentData: {
    paymentMethod: string;
    transactionId?: string;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return api.post(`/deals/${id}/deposit-payment`, paymentData);
  },

  async uploadDealDocument(
    dealId: string, 
    file: File, 
    documentType: string,
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
  ): Promise<{ success: boolean; message: string; data: any }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(new Error(response.message || 'Upload failed'));
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      // Set up the request
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      xhr.open('POST', `${apiUrl}/deals/${dealId}/documents`);
      xhr.send(formData);
    });
  }
};