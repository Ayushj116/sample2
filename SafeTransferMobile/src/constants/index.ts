export const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000/api' // Android emulator
  : 'https://api.safetransfer.in/api';

export const WS_BASE_URL = __DEV__
  ? 'ws://10.0.2.2:5000'
  : 'wss://api.safetransfer.in';

export const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  secondary: '#10b981',
  secondaryDark: '#059669',
  accent: '#f59e0b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Grays
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Background
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  surface: '#ffffff',
  
  // Text
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  // Border
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  // Status colors
  statusPending: '#f59e0b',
  statusActive: '#3b82f6',
  statusCompleted: '#10b981',
  statusCancelled: '#6b7280',
  statusDisputed: '#ef4444',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const SIZES = {
  // Padding & Margin
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Font sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body: 16,
  bodySmall: 14,
  caption: 12,
  
  // Border radius
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,
  
  // Icon sizes
  iconXs: 16,
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,
};

export const DEAL_CATEGORIES = [
  { value: 'vehicle', label: 'Vehicle Sale', icon: 'car' },
  { value: 'real_estate', label: 'Real Estate', icon: 'home' },
  { value: 'domain', label: 'Domain Name', icon: 'globe' },
  { value: 'freelancing', label: 'Freelancing', icon: 'briefcase' },
  { value: 'other', label: 'Other', icon: 'package' }
];

export const DELIVERY_METHODS = [
  { value: 'in_person', label: 'In-Person Pickup' },
  { value: 'courier', label: 'Courier/Shipping' },
  { value: 'digital', label: 'Digital Transfer' },
  { value: 'other', label: 'Other' }
];

export const INSPECTION_PERIODS = [
  { value: 1, label: '1 Day' },
  { value: 3, label: '3 Days' },
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' }
];

export const BUSINESS_TYPES = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'private_limited', label: 'Private Limited' },
  { value: 'public_limited', label: 'Public Limited' },
  { value: 'llp', label: 'LLP' }
];

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  NOTIFICATION_SETTINGS: 'notification_settings',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LAST_SYNC: 'last_sync_timestamp',
};

export const NOTIFICATION_TYPES = {
  DEAL_UPDATE: 'deal_update',
  KYC_UPDATE: 'kyc_update',
  PAYMENT_UPDATE: 'payment_update',
  MESSAGE: 'message',
  SYSTEM: 'system',
};

export const DEAL_STATUSES = {
  CREATED: 'created',
  ACCEPTED: 'accepted',
  KYC_PENDING: 'kyc_pending',
  DOCUMENTS_PENDING: 'documents_pending',
  PAYMENT_PENDING: 'payment_pending',
  CONTRACT_PENDING: 'contract_pending',
  FUNDS_DEPOSITED: 'funds_deposited',
  IN_DELIVERY: 'in_delivery',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const KYC_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const DOCUMENT_TYPES = {
  PAN_CARD: 'panCard',
  AADHAAR_FRONT: 'aadhaarFront',
  AADHAAR_BACK: 'aadhaarBack',
  BANK_STATEMENT: 'bankStatement',
  ADDRESS_PROOF: 'addressProof',
  BUSINESS_REGISTRATION: 'businessRegistration',
  GST_CERTIFICATE: 'gstCertificate',
  BUSINESS_BANK_STATEMENT: 'businessBankStatement',
  AUTHORIZED_SIGNATORY_ID: 'authorizedSignatoryId',
};

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png'],
  PDF: ['application/pdf'],
  DOCUMENT: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const REGEX_PATTERNS = {
  PHONE: /^[6-9]\d{9}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^[0-9]{12}$/,
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  PINCODE: /^[1-9][0-9]{5}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

export const HAPTIC_FEEDBACK = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};