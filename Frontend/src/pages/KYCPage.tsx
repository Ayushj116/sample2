import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Shield,
  Clock,
  User,
  Building,
  Save,
  Upload,
  X
} from 'lucide-react';
import { kycService, KYCData } from '../services/kycService';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';

const KYCPage = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [personalInfo, setPersonalInfo] = useState({
    panNumber: '',
    aadhaarNumber: '',
    currentAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    },
    bankAccount: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: '',
      accountType: 'savings' as 'savings' | 'current'
    }
  });

  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessType: '',
    registrationNumber: '',
    gstin: '',
    businessAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  useEffect(() => {
    fetchKYCData();
  }, []);

  const fetchKYCData = async () => {
    try {
      setIsLoading(true);
      const response = await kycService.getKYCStatus();
      if (response.success) {
        setKycData(response.data);
        if (response.data.personalInfo) {
          setPersonalInfo({ ...personalInfo, ...response.data.personalInfo });
        }
        if (response.data.businessInfo) {
          setBusinessInfo({ ...businessInfo, ...response.data.businessInfo });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load KYC data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    try {
      setUploadingDocs(prev => ({ ...prev, [documentType]: true }));
      setError('');
      
      const response = await kycService.uploadDocument(documentType, file);
      
      if (response.success) {
        setSuccessMessage(`${documentType} uploaded successfully`);
        setTimeout(() => setSuccessMessage(''), 3000);
        // Refresh KYC data to show updated document status
        await fetchKYCData();
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      setError(error.message || 'Upload failed');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUploadingDocs(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const validatePersonalInfo = () => {
    const errors: Record<string, string> = {};
    
    if (personalInfo.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(personalInfo.panNumber)) {
      errors.panNumber = 'Invalid PAN number format (e.g., ABCDE1234F)';
    }
    
    if (personalInfo.aadhaarNumber && !/^[0-9]{12}$/.test(personalInfo.aadhaarNumber.replace(/\s/g, ''))) {
      errors.aadhaarNumber = 'Invalid Aadhaar number format (12 digits)';
    }
    
    if (personalInfo.currentAddress.pincode && !/^[1-9][0-9]{5}$/.test(personalInfo.currentAddress.pincode)) {
      errors.pincode = 'Invalid pincode format';
    }
    
    if (personalInfo.bankAccount.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(personalInfo.bankAccount.ifscCode)) {
      errors.ifscCode = 'Invalid IFSC code format';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBusinessInfo = () => {
    const errors: Record<string, string> = {};
    
    if (businessInfo.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(businessInfo.gstin)) {
      errors.gstin = 'Invalid GSTIN format';
    }
    
    if (businessInfo.businessAddress.pincode && !/^[1-9][0-9]{5}$/.test(businessInfo.businessAddress.pincode)) {
      errors.businessPincode = 'Invalid pincode format';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const savePersonalInfo = async () => {
    if (!validatePersonalInfo()) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setFieldErrors({});
      
      const response = await kycService.updatePersonalInfo(personalInfo);
      
      if (response.success) {
        setSuccessMessage('Personal information saved successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchKYCData(); // Refresh data
      }
    } catch (err: any) {
      if (err.data?.errors) {
        const errors: Record<string, string> = {};
        err.data.errors.forEach((error: any) => {
          errors[error.field] = error.message;
        });
        setFieldErrors(errors);
      } else {
        setError(err.message || 'Failed to save personal information');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveBusinessInfo = async () => {
    if (!validateBusinessInfo()) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setFieldErrors({});
      
      const response = await kycService.updateBusinessInfo(businessInfo);
      
      if (response.success) {
        setSuccessMessage('Business information saved successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchKYCData(); // Refresh data
      }
    } catch (err: any) {
      if (err.data?.errors) {
        const errors: Record<string, string> = {};
        err.data.errors.forEach((error: any) => {
          errors[error.field] = error.message;
        });
        setFieldErrors(errors);
      } else {
        setError(err.message || 'Failed to save business information');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const submitKYC = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      const response = await kycService.submitKYC({
        kycType: activeTab as 'personal' | 'business',
        personalInfo: activeTab === 'personal' ? personalInfo : undefined,
        businessInfo: activeTab === 'business' ? businessInfo : undefined
      });
      
      if (response.success) {
        setSuccessMessage('KYC submitted for verification successfully');
        
        // Update user KYC status in context
        if (user) {
          const updatedUser = { ...user, kycStatus: 'in_progress' as const };
          updateUser(updatedUser);
        }
        
        fetchKYCData();
        
        // Redirect to dashboard after successful submission
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit KYC');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5" />;
      case 'in_progress':
        return <Clock className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const DocumentUploadSection = ({ 
    title, 
    description, 
    docType, 
    isRequired = true,
    acceptedFormats = "PDF, JPG, PNG" 
  }: {
    title: string;
    description: string;
    docType: string;
    isRequired?: boolean;
    acceptedFormats?: string;
  }) => {
    const documentData = kycData?.documents?.[docType as keyof typeof kycData.documents];
    const isUploaded = documentData && documentData.fileUrl;
    const isUploading = uploadingDocs[docType];
    
    return (
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {title}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <p className="text-sm text-gray-600">{description}</p>
            <p className="text-xs text-gray-500 mt-1">Accepted: {acceptedFormats}</p>
          </div>
          {isUploaded && (
            <div className="text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          )}
        </div>
        
        {isUploaded ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Document uploaded and {documentData.verified ? 'verified' : 'pending verification'}
              </span>
            </div>
            {documentData.verificationNotes && (
              <p className="text-sm text-green-700 mt-2">{documentData.verificationNotes}</p>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size (10MB max)
                      if (file.size > 10 * 1024 * 1024) {
                        setError('File size must be less than 10MB');
                        return;
                      }
                      
                      // Validate file type
                      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
                      if (!allowedTypes.includes(file.type)) {
                        setError('Only PDF, JPG, and PNG files are allowed');
                        return;
                      }
                      
                      handleDocumentUpload(file, docType);
                    }
                  }}
                  className="hidden"
                  id={`file-${docType}`}
                />
                <label htmlFor={`file-${docType}`} className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Upload {title}</p>
                  <p className="text-xs text-gray-500 mt-1">Click to select file</p>
                </label>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // Check if KYC is complete enough to be considered approved
  const isKYCComplete = () => {
    if (!kycData) return false;
    
    // Check if basic documents are uploaded
    const hasRequiredDocs = kycData.documents?.panCard?.fileUrl && 
                           kycData.documents?.aadhaarFront?.fileUrl && 
                           kycData.documents?.bankStatement?.fileUrl;
    
    // Check if basic info is filled
    const hasBasicInfo = personalInfo.panNumber && personalInfo.aadhaarNumber;
    
    return hasRequiredDocs && hasBasicInfo && kycData.status === 'approved';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
          <p className="text-gray-600">Complete your identity verification to secure your transactions</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Status Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg flex items-center space-x-3 ${getStatusColor(kycData?.status || 'pending')}`}>
              {getStatusIcon(kycData?.status || 'pending')}
              <div>
                <div className="font-medium">Personal KYC</div>
                <div className="text-sm capitalize">{kycData?.status?.replace('_', ' ') || 'pending'}</div>
              </div>
            </div>
            <div className={`p-4 rounded-lg flex items-center space-x-3 ${getStatusColor('pending')}`}>
              {getStatusIcon('pending')}
              <div>
                <div className="font-medium">Business KYC</div>
                <div className="text-sm capitalize">pending</div>
              </div>
            </div>
          </div>
          
          {/* Show completion status */}
          {isKYCComplete() && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">KYC verification completed successfully!</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'personal'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Personal KYC</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'business'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>Business KYC</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Personal KYC Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Identity Verification</h3>
                  <p className="text-gray-600">
                    Upload your government-issued identity documents for verification. 
                    All documents are encrypted and securely stored.
                  </p>
                </div>

                {/* Personal Information Form */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={personalInfo.panNumber}
                        onChange={(e) => {
                          setPersonalInfo(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }));
                          if (fieldErrors.panNumber) {
                            setFieldErrors(prev => ({ ...prev, panNumber: '' }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldErrors.panNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                      {fieldErrors.panNumber && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.panNumber}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        value={personalInfo.aadhaarNumber}
                        onChange={(e) => {
                          setPersonalInfo(prev => ({ ...prev, aadhaarNumber: e.target.value.replace(/\D/g, '') }));
                          if (fieldErrors.aadhaarNumber) {
                            setFieldErrors(prev => ({ ...prev, aadhaarNumber: '' }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldErrors.aadhaarNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="1234 5678 9012"
                        maxLength={12}
                      />
                      {fieldErrors.aadhaarNumber && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.aadhaarNumber}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-3">Current Address</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Address Line 1"
                          value={personalInfo.currentAddress.line1}
                          onChange={(e) => setPersonalInfo(prev => ({ 
                            ...prev, 
                            currentAddress: { ...prev.currentAddress, line1: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="City"
                        value={personalInfo.currentAddress.city}
                        onChange={(e) => setPersonalInfo(prev => ({ 
                          ...prev, 
                          currentAddress: { ...prev.currentAddress, city: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={personalInfo.currentAddress.state}
                        onChange={(e) => setPersonalInfo(prev => ({ 
                          ...prev, 
                          currentAddress: { ...prev.currentAddress, state: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={personalInfo.currentAddress.pincode}
                        onChange={(e) => {
                          setPersonalInfo(prev => ({ 
                            ...prev, 
                            currentAddress: { ...prev.currentAddress, pincode: e.target.value.replace(/\D/g, '') }
                          }));
                          if (fieldErrors.pincode) {
                            setFieldErrors(prev => ({ ...prev, pincode: '' }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldErrors.pincode ? 'border-red-300' : 'border-gray-300'
                        }`}
                        maxLength={6}
                      />
                      {fieldErrors.pincode && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.pincode}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={savePersonalInfo}
                    disabled={isSaving}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Information'}
                  </button>
                </div>

                {/* Document Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DocumentUploadSection
                    title="PAN Card"
                    description="Upload clear image of your PAN card"
                    docType="panCard"
                    acceptedFormats="PDF, JPG, PNG (Max 10MB)"
                  />

                  <DocumentUploadSection
                    title="Aadhaar Card"
                    description="Upload front side of Aadhaar card"
                    docType="aadhaarFront"
                    acceptedFormats="PDF, JPG, PNG (Max 10MB)"
                  />

                  <DocumentUploadSection
                    title="Bank Statement"
                    description="Latest 3-month bank statement"
                    docType="bankStatement"
                    acceptedFormats="PDF (Max 10MB)"
                  />

                  <DocumentUploadSection
                    title="Address Proof"
                    description="Utility bill, rent agreement, or passport"
                    docType="addressProof"
                    acceptedFormats="PDF, JPG, PNG (Max 10MB)"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Data Security</h3>
                      <p className="text-blue-800 text-sm">
                        Your documents are encrypted with bank-grade security and used only for 
                        verification purposes. We comply with all Indian data protection regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business KYC Tab */}
            {activeTab === 'business' && (
              <div className="space-y-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Verification</h3>
                  <p className="text-gray-600">
                    Required for high-value transactions and business accounts. 
                    Upload your business registration and tax documents.
                  </p>
                </div>

                {/* Business Information Form */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={businessInfo.businessName}
                        onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your Business Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        value={businessInfo.gstin}
                        onChange={(e) => {
                          setBusinessInfo(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }));
                          if (fieldErrors.gstin) {
                            setFieldErrors(prev => ({ ...prev, gstin: '' }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldErrors.gstin ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                      />
                      {fieldErrors.gstin && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.gstin}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={saveBusinessInfo}
                    disabled={isSaving}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Information'}
                  </button>
                </div>

                {/* Business Document Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DocumentUploadSection
                    title="Business Registration"
                    description="Certificate of Incorporation or Partnership Deed"
                    docType="businessRegistration"
                    acceptedFormats="PDF (Max 10MB)"
                  />

                  <DocumentUploadSection
                    title="GSTIN Certificate"
                    description="GST registration certificate"
                    docType="gstCertificate"
                    isRequired={false}
                    acceptedFormats="PDF, JPG, PNG (Max 10MB)"
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Business KYC Optional</h3>
                      <p className="text-yellow-800 text-sm">
                        Business verification is optional for most transactions but required 
                        for deals above ₹10 lakhs or when dealing with business entities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link
            to="/dashboard"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Save & Continue Later
          </Link>
          
          {!isKYCComplete() && (
            <button
              onClick={submitKYC}
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Shield className="w-5 h-5 mr-2" />
              {isSaving ? 'Submitting...' : 'Submit for Verification'}
            </button>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-100 p-6 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Document Requirements</h4>
              <p className="text-gray-600">Ensure documents are clear, unblurred, and all corners are visible</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Verification Time</h4>
              <p className="text-gray-600">Personal KYC: 2-4 hours, Business KYC: 24-48 hours</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Support</h4>
              <p className="text-gray-600">Email: kyc@safetransfer.in | Phone: +91 98765 43210</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Document Security</h4>
              <p className="text-gray-600">All uploads are encrypted and stored securely in India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCPage;