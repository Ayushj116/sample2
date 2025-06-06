import { api } from './api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  };
}

class FileUploadService {
  async uploadFile(
    file: File,
    endpoint: string,
    additionalData?: Record<string, string>,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional data if provided
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });

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
      xhr.open('POST', `${apiUrl}${endpoint}`);
      xhr.send(formData);
    });
  }

  async uploadKYCDocument(
    file: File,
    documentType: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return this.uploadFile(
      file,
      '/kyc/upload',
      { documentType },
      onProgress
    );
  }

  async uploadDealDocument(
    file: File,
    dealId: string,
    documentType: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return this.uploadFile(
      file,
      `/deals/${dealId}/documents`,
      { documentType },
      onProgress
    );
  }

  validateFile(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }): { valid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      };
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `File extension must be one of: ${allowedExtensions.join(', ')}`
        };
      }
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileUploadService = new FileUploadService();