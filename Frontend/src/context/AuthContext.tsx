import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService } from '../services/authService';
import { notificationService } from '../services/notificationService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    
    if (currentUser && token) {
      setUser(currentUser);
      
      // Connect to notification service
      notificationService.connect(currentUser.id);
      
      // Request notification permission
      notificationService.requestPermission();
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        setUser(response.data.user);
        
        // Connect to notification service
        notificationService.connect(response.data.user.id);
        notificationService.requestPermission();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setUser(response.data.user);
        
        // Connect to notification service
        notificationService.connect(response.data.user.id);
        notificationService.requestPermission();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    notificationService.disconnect();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};