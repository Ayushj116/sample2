export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  userType: 'personal' | 'business';
  businessName?: string;
  phoneVerified: boolean;
  kycStatus: 'pending' | 'in_progress' | 'approved' | 'rejected';
  isAdmin: boolean;
  avatar?: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  dealId: string;
  title: string;
  description: string;
  category: 'vehicle' | 'real_estate' | 'domain' | 'freelancing' | 'other';
  amount: number;
  escrowFee: number;
  deliveryMethod: 'in_person' | 'courier' | 'digital' | 'other';
  inspectionPeriod: number;
  status: string;
  buyer: User;
  seller: User;
  role?: 'buyer' | 'seller';
  nextAction: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface KYCData {
  user: string;
  kycType: 'personal' | 'business';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  documents: Record<string, any>;
  personalInfo?: any;
  businessInfo?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'deal_update' | 'kyc_update' | 'payment_update' | 'message' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface CreateDealRequest {
  title: string;
  description: string;
  category: string;
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