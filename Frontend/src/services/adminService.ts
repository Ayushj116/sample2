import { api } from './api';

export interface AdminStats {
  activeDeals: number;
  totalVolume: string;
  newUsers: number;
  successRate: string;
}

export interface FlaggedDeal {
  id: string;
  dealId: string;
  title: string;
  amount: number;
  flag: string;
  severity: 'low' | 'medium' | 'high';
  buyer: string;
  seller: string;
  flaggedAt: string;
}

export interface KYCReview {
  id: string;
  user: string;
  type: 'personal' | 'business';
  status: 'pending' | 'review' | 'approved' | 'rejected';
  submittedAt: string;
  documents: string[];
}

export interface AdminDashboardData {
  stats: AdminStats;
  flaggedDeals: FlaggedDeal[];
  kycReviews: KYCReview[];
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
}

export const adminService = {
  async getDashboardData(): Promise<{ success: boolean; data: AdminDashboardData }> {
    return api.get('/admin/dashboard');
  },

  async getFlaggedDeals(params?: {
    page?: number;
    limit?: number;
    severity?: string;
  }): Promise<{ success: boolean; data: { deals: FlaggedDeal[]; pagination: any } }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get(`/admin/flagged-deals${queryString ? `?${queryString}` : ''}`);
  },

  async getKYCReviews(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ success: boolean; data: { reviews: KYCReview[]; pagination: any } }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get(`/admin/kyc-reviews${queryString ? `?${queryString}` : ''}`);
  },

  async reviewKYC(kycId: string, action: 'approve' | 'reject', notes?: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/admin/kyc/${kycId}/${action}`, { notes });
  },

  async reviewDeal(dealId: string, action: 'approve' | 'flag' | 'investigate', notes?: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/admin/deals/${dealId}/${action}`, { notes });
  },

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: string;
    kycStatus?: string;
  }): Promise<{ success: boolean; data: { users: any[]; pagination: any } }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  async getAllDeals(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Promise<{ success: boolean; data: { deals: any[]; pagination: any } }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get(`/admin/deals${queryString ? `?${queryString}` : ''}`);
  }
};