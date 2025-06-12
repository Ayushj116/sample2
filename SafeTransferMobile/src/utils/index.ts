import * as Haptics from 'expo-haptics';
import { HAPTIC_FEEDBACK, REGEX_PATTERNS } from '@/constants';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(d);
  }
};

export const validatePhone = (phone: string): boolean => {
  return REGEX_PATTERNS.PHONE.test(phone);
};

export const validatePAN = (pan: string): boolean => {
  return REGEX_PATTERNS.PAN.test(pan);
};

export const validateAadhaar = (aadhaar: string): boolean => {
  return REGEX_PATTERNS.AADHAAR.test(aadhaar.replace(/\s/g, ''));
};

export const validateGSTIN = (gstin: string): boolean => {
  return REGEX_PATTERNS.GSTIN.test(gstin);
};

export const validateIFSC = (ifsc: string): boolean => {
  return REGEX_PATTERNS.IFSC.test(ifsc);
};

export const validatePincode = (pincode: string): boolean => {
  return REGEX_PATTERNS.PINCODE.test(pincode);
};

export const validateEmail = (email: string): boolean => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const formatPAN = (pan: string): string => {
  return pan.toUpperCase().replace(/(.{5})(.{4})(.{1})/, '$1$2$3');
};

export const formatAadhaar = (aadhaar: string): string => {
  const cleaned = aadhaar.replace(/\D/g, '');
  return cleaned.replace(/(.{4})(.{4})(.{4})/, '$1 $2 $3');
};

export const formatGSTIN = (gstin: string): string => {
  return gstin.toUpperCase();
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return '#10b981';
    case 'funds_deposited':
    case 'in_delivery':
      return '#3b82f6';
    case 'created':
    case 'accepted':
      return '#f59e0b';
    case 'kyc_pending':
    case 'documents_pending':
    case 'payment_pending':
    case 'contract_pending':
      return '#f97316';
    case 'disputed':
      return '#ef4444';
    case 'cancelled':
      return '#6b7280';
    default:
      return '#6b7280';
  }
};

export const getStatusLabel = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const calculateEscrowFee = (amount: number, userType: 'personal' | 'business' = 'personal') => {
  let percentage = userType === 'business' ? 0.02 : 0.025;
  let minFee = userType === 'business' ? 1000 : 500;
  let maxFee = userType === 'business' ? 50000 : 25000;

  const calculatedFee = amount * percentage;
  const fee = Math.min(Math.max(calculatedFee, minFee), maxFee);
  const gst = fee * 0.18;
  const totalFee = fee + gst;

  return {
    amount,
    percentage: percentage * 100,
    baseFee: fee,
    gst,
    totalFee,
    breakdown: {
      escrowFee: fee,
      gst,
      total: totalFee
    }
  };
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateDealId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ST${timestamp}${random}`.toUpperCase();
};

export const hapticFeedback = (type: keyof typeof HAPTIC_FEEDBACK = 'LIGHT') => {
  switch (type) {
    case 'LIGHT':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'MEDIUM':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'HEAVY':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'SUCCESS':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'WARNING':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'ERROR':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

export const snakeToCamel = (str: string): string => {
  return str.replace(/([-_][a-z])/g, group =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};