import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Image } from 'lucide-react';

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
    documentType?: string;
  };
}

interface FileUploadProps {
  onUpload: (result: UploadResult) => void;
  onError: (error: string) => void;
  accept?: string;
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  documentType?: string;
}

interface FileUploadState {
  isDragging: boolean;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  uploadedFile: UploadResult | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  onError,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
  allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'],
  multiple = false,
  disabled = false,
  className = '',
  children,
  documentType
}) => {
  const [state, setState] = useState<FileUploadState>({
    isDragging: false,
    isUploading: false,
    progress: null,
    error: null,
    uploadedFile: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
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
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setState(prev => ({ ...prev, isDragging: true }));
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragging: false }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragging: false }));
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const file = files[0]; // Handle single file for now
    
    // Validate file
    const validation = validateFile(file);

    if (!validation.valid) {
      setState(prev => ({ ...prev, error: validation.error || 'Invalid file' }));
      onError(validation.error || 'Invalid file');
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isUploading: true, 
      error: null, 
      progress: { loaded: 0, total: file.size, percentage: 0 }
    }));

    try {
      // Create FormData for actual upload
      const formData = new FormData();
      formData.append('document', file);
      if (documentType) {
        formData.append('documentType', documentType);
      }

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setState(prev => ({ 
            ...prev, 
            progress: { 
              loaded: event.loaded, 
              total: event.total, 
              percentage 
            }
          }));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          
          if (xhr.status >= 200 && xhr.status < 300 && response.success) {
            const result: UploadResult = {
              success: true,
              message: response.message || 'File uploaded successfully',
              data: {
                fileName: response.data?.fileName || file.name,
                fileUrl: response.data?.fileUrl || '',
                fileSize: response.data?.fileSize || file.size,
                mimeType: response.data?.mimeType || file.type,
                documentType: documentType
              }
            };

            setState(prev => ({ 
              ...prev, 
              isUploading: false, 
              progress: null, 
              uploadedFile: result 
            }));
            
            onUpload(result);
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } catch (parseError) {
          throw new Error('Invalid response from server');
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        throw new Error('Network error during upload');
      });

      xhr.addEventListener('abort', () => {
        throw new Error('Upload was cancelled');
      });

      // Set up the request
      xhr.open('POST', `${import.meta.env.VITE_API_URL}/kyc/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      // Send the request
      xhr.send(formData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState(prev => ({ 
        ...prev, 
        isUploading: false, 
        progress: null, 
        error: errorMessage 
      }));
      onError(errorMessage);
    }
  };

  const handleRemove = () => {
    setState(prev => ({ 
      ...prev, 
      uploadedFile: null, 
      error: null 
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-8 h-8" />;
    }
    return <FileText className="w-8 h-8" />;
  };

  if (state.uploadedFile) {
    return (
      <div className={`border-2 border-green-300 bg-green-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">{state.uploadedFile.data?.fileName}</p>
              <p className="text-sm text-green-700">
                {state.uploadedFile.data?.fileSize && 
                  formatFileSize(state.uploadedFile.data.fileSize)
                } - Uploaded successfully
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 hover:bg-green-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${state.isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${state.error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        {state.isUploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm font-medium text-gray-700">Uploading...</p>
            {state.progress && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress.percentage}%` }}
                ></div>
              </div>
            )}
            <p className="text-xs text-gray-500">
              {state.progress && `${state.progress.percentage}% complete`}
            </p>
          </div>
        ) : state.error ? (
          <div className="space-y-2">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <p className="text-sm font-medium text-red-900">Upload Failed</p>
            <p className="text-xs text-red-700">{state.error}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setState(prev => ({ ...prev, error: null }));
              }}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        ) : children ? (
          children
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-medium text-gray-700">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-500">
              Supports: {allowedExtensions.join(', ').toUpperCase()} 
              (Max: {formatFileSize(maxSize)})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;