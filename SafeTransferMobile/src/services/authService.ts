import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { STORAGE_KEYS } from '@/constants';
import { User, AuthResponse } from '@/types';

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

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    
    if (response.success && response.data.token) {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    
    if (response.success && response.data.token) {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
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

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },

  async updateUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
};