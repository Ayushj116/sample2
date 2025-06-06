import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Camera,
  Shield,
  Clock,
  User,
  Building
} from 'lucide-react';

const KYCPage = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadedDocs, setUploadedDocs] = useState({
    panCard: null,
    aadhaar: null,
    bankStatement: null,
    addressProof: null,
    businessRegistration: null,
    gstin: null
  });

  const [kycStatus, setKycStatus] = useState({
    personal: 'in-progress', // pending, in-progress, approved, rejected
    business: 'pending'
  });

  const handleFileUpload = (docType: string, file: File | null) => {
    setUploadedDocs(prev => ({
      ...prev,
      [docType]: file
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'in-progress':
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
      case 'in-progress':
        return <Clock className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const DocumentUpload = ({ 
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
    const isUploaded = uploadedDocs[docType as keyof typeof uploadedDocs];
    
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
        
        <div className="space-y-3">
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isUploaded 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <input
              type="file"
              id={docType}
              className="sr-only"
              onChange={(e) => handleFileUpload(docType, e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label htmlFor={docType} className="cursor-pointer">
              <div className="flex flex-col items-center">
                {isUploaded ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-green-600">Document uploaded</span>
                    <span className="text-xs text-gray-500">Click to replace</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Upload document</span>
                    <span className="text-xs text-gray-500">or drag and drop</span>
                  </>
                )}
              </div>
            </label>
          </div>
          
          {!isUploaded && (
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </button>
          )}
        </div>
      </div>
    );
  };

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

        {/* Status Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg flex items-center space-x-3 ${getStatusColor(kycStatus.personal)}`}>
              {getStatusIcon(kycStatus.personal)}
              <div>
                <div className="font-medium">Personal KYC</div>
                <div className="text-sm capitalize">{kycStatus.personal.replace('-', ' ')}</div>
              </div>
            </div>
            <div className={`p-4 rounded-lg flex items-center space-x-3 ${getStatusColor(kycStatus.business)}`}>
              {getStatusIcon(kycStatus.business)}
              <div>
                <div className="font-medium">Business KYC</div>
                <div className="text-sm capitalize">{kycStatus.business.replace('-', ' ')}</div>
              </div>
            </div>
          </div>
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
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Identity Verification</h3>
                  <p className="text-gray-600">
                    Upload your government-issued identity documents for verification. 
                    All documents are encrypted and securely stored.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DocumentUpload
                    title="PAN Card"
                    description="Upload clear image of your PAN card"
                    docType="panCard"
                    acceptedFormats="PDF, JPG, PNG (Max 5MB)"
                  />

                  <DocumentUpload
                    title="Aadhaar Card"
                    description="Upload front and back of Aadhaar card"
                    docType="aadhaar"
                    acceptedFormats="PDF, JPG, PNG (Max 5MB)"
                  />

                  <DocumentUpload
                    title="Bank Statement"
                    description="Latest 3-month bank statement"
                    docType="bankStatement"
                    acceptedFormats="PDF (Max 10MB)"
                  />

                  <DocumentUpload
                    title="Address Proof"
                    description="Utility bill, rent agreement, or passport"
                    docType="addressProof"
                    acceptedFormats="PDF, JPG, PNG (Max 5MB)"
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
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Verification</h3>
                  <p className="text-gray-600">
                    Required for high-value transactions and business accounts. 
                    Upload your business registration and tax documents.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DocumentUpload
                    title="Business Registration"
                    description="Certificate of Incorporation or Partnership Deed"
                    docType="businessRegistration"
                    acceptedFormats="PDF (Max 10MB)"
                  />

                  <DocumentUpload
                    title="GSTIN Certificate"
                    description="GST registration certificate"
                    docType="gstin"
                    isRequired={false}
                    acceptedFormats="PDF, JPG, PNG (Max 5MB)"
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
          
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Shield className="w-5 h-5 mr-2" />
            Submit for Verification
          </button>
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