import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import { STORAGE_KEYS } from '@/constants';
import { User } from '@/types';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check onboarding status
      const onboardingCompleted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      setHasCompletedOnboarding(onboardingCompleted === 'true');
      
      // Check authentication
      const token = await authService.getToken();
      const userData = await authService.getCurrentUser();
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
        
        // Initialize notification service
        await notificationService.initialize();
        notificationService.connect(userData.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (phone: string, password: string) => {
    try {
      const response = await authService.login({ phone, password });
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        // Initialize notification service
        await notificationService.initialize();
        notificationService.connect(response.data.user.id);
        
        return response;
      }
      throw new Error(response.message);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        
        // Initialize notification service
        await notificationService.initialize();
        notificationService.connect(response.data.user.id);
        
        return response;
      }
      throw new Error(response.message);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      notificationService.disconnect();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await authService.updateUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Complete onboarding error:', error);
    }
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    hasCompletedOnboarding,
    login,
    register,
    logout,
    updateUser,
    completeOnboarding,
    checkAuthStatus,
  };
};