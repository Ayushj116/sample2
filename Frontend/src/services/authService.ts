import { api } from './api';

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

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  userType: 'personal' | 'business';
  businessName?: string;
  businessType?: string;
  gstin?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async forgotPassword(phone: string): Promise<{ success: boolean; message: string }> {
    return api.post('/auth/forgot-password', { phone });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return api.post('/auth/reset-password', { token, newPassword });
  },

  async verifyPhone(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    return api.post('/auth/verify-phone', { phone, otp });
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};