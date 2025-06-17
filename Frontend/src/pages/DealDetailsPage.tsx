import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MessageSquare,
  FileText,
  Shield,
  User,
  Calendar,
  DollarSign,
  Truck,
  Eye,
  Download,
  Send,
  Upload,
  X,
  RefreshCw,
  Bell,
  Info,
  ExternalLink
} from 'lucide-react';
import { dealService, Deal } from '../services/dealService';
import { useAuth } from '../context/AuthContext';

const DealDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [acceptingDeal, setAcceptingDeal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasShownKYCAlert, setHasShownKYCAlert] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDeal();
    }
  }, [id]);

  const fetchDeal = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');
      
      const response = await dealService.getDeal(id!);
      
      if (response.success) {
        setDeal(response.data.deal);
        
        // Check if seller KYC is required and redirect (only show once)
        if (response.data.deal.status === 'accepted' && 
            response.data.deal.role === 'seller' &&
            user?.kycStatus !== 'approved' && 
            !hasShownKYCAlert) {
          setHasShownKYCAlert(true);
          // Show KYC requirement message after a delay
          setTimeout(() => {
            if (window.confirm('KYC verification is mandatory for sellers to proceed with this deal. Would you like to complete it now?')) {
              navigate('/kyc');
            }
          }, 1000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load deal details');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDeal(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !deal) return;

    try {
      setSendingMessage(true);
      await dealService.addMessage(deal.id, newMessage.trim());
      setNewMessage('');
      await fetchDeal(true); // Refresh to get new message
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAcceptDeal = async () => {
    if (!deal) return;

    try {
      setAcceptingDeal(true);
      setError('');
      
      const response = await dealService.acceptDeal(deal.id);
      
      if (response.success) {
        // Update the deal state with the new data from the response
        if (response.data?.deal) {
          setDeal(prevDeal => ({
            ...prevDeal!,
            ...response.data.deal,
            // Preserve other fields that might not be in the response
            title: prevDeal!.title,
            description: prevDeal!.description,
            buyer: prevDeal!.buyer,
            seller: prevDeal!.seller,
          }));
        }
        
        // Show success message temporarily
        const successMessage = deal.status === 'created' && response.data?.deal?.status === 'accepted' 
          ? 'Deal fully accepted by both parties! Next step: Seller must complete KYC verification.'
          : 'Deal accepted successfully! Waiting for counterparty acceptance.';
        
        // You could show a toast notification here instead of alert
        setTimeout(() => {
          alert(successMessage);
        }, 100);
        
        // Refresh the deal data to ensure we have the latest state
        setTimeout(() => {
          fetchDeal(true);
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept deal');
    } finally {
      setAcceptingDeal(false);
    }
  };

  const handleSendKYCReminder = async () => {
    if (!deal) return;

    try {
      setSendingReminder(true);
      setError('');
      
      const response = await dealService.sendKYCReminder(deal.id);
      
      if (response.success) {
        alert('KYC reminder sent successfully!');
        await fetchDeal(true); // Refresh to get new system message
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'funds_deposited':
      case 'in_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'created':
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disputed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const shouldShowKYCReminder = () => {
    if (!deal) return false;
    
    const nextAction = deal.nextAction;
    return nextAction.includes('Waiting for') && nextAction.includes('KYC') && nextAction.includes('Send reminder');
  };

  const getRequiredDocuments = () => {
    if (!deal) return [];
    
    const documents = {
      buyer: [],
      seller: []
    };

    // Seller always needs ownership/authenticity documents
    switch (deal.category) {
      case 'vehicle':
        documents.seller = [
          { type: 'ownership', name: 'Vehicle Registration Certificate (RC)', required: true },
          { type: 'ownership', name: 'Insurance Certificate', required: true },
          { type: 'ownership', name: 'Pollution Certificate', required: false },
          { type: 'ownership', name: 'Service Records', required: false }
        ];
        break;
      case 'real_estate':
        documents.seller = [
          { type: 'ownership', name: 'Property Title Deed', required: true },
          { type: 'ownership', name: 'Property Tax Receipt', required: true },
          { type: 'ownership', name: 'NOC from Society/Builder', required: false },
          { type: 'ownership', name: 'Encumbrance Certificate', required: true }
        ];
        break;
      case 'domain':
        documents.seller = [
          { type: 'ownership', name: 'Domain Ownership Certificate', required: true },
          { type: 'ownership', name: 'Domain Transfer Authorization', required: true }
        ];
        break;
      case 'freelancing':
        documents.seller = [
          { type: 'agreement', name: 'Work Portfolio/Samples', required: true },
          { type: 'agreement', name: 'Project Specification Document', required: true }
        ];
        documents.buyer = [
          { type: 'agreement', name: 'Project Requirements Document', required: true }
        ];
        break;
      default:
        documents.seller = [
          { type: 'ownership', name: 'Proof of Ownership', required: true },
          { type: 'other', name: 'Item Description/Specification', required: true }
        ];
    }

    return documents[deal.role] || [];
  };

  const shouldShowDocumentUpload = () => {
    if (!deal) return false;
    return deal.nextAction.includes('Upload required documents');
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

  if (error && !deal) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Deal</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Deal Not Found</h2>
            <p className="text-gray-600 mb-4">The deal you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
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
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{deal.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Deal ID: {deal.dealId}</span>
                <span>•</span>
                <span>Your Role: {deal.role}</span>
                <span>•</span>
                <span>Created: {new Date(deal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(deal.status)}`}>
                {formatStatus(deal.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-600">{error}</p>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* KYC Warning - Only show for sellers */}
        {deal.status === 'accepted' && deal.role === 'seller' && user?.kycStatus !== 'approved' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <h3 className="font-semibold text-red-900">KYC Verification Required (Mandatory for Sellers)</h3>
                  <p className="text-red-800">As a seller, you must complete KYC verification to proceed with this deal.</p>
                </div>
              </div>
              <Link
                to="/kyc"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Complete KYC
              </Link>
            </div>
          </div>
        )}

        {/* Document Upload Requirements */}
        {shouldShowDocumentUpload() && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="w-6 h-6 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Required Documents for {deal.category.replace('_', ' ')} Transaction</h3>
                <p className="text-blue-800 mb-3">Please upload the following documents to proceed:</p>
                <div className="space-y-2">
                  {getRequiredDocuments().map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${doc.required ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                      <span className={`text-sm ${doc.required ? 'font-medium text-blue-900' : 'text-blue-700'}`}>
                        {doc.name} {doc.required && <span className="text-red-500">*</span>}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    <span className="text-red-500">*</span> Required documents must be uploaded before proceeding
                  </span>
                </div>
              </div>
              <Link
                to={`/deal/${deal.id}/documents`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Link>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Deal Progress</h2>
            <span className="text-sm text-gray-500">{deal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${deal.progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Next: {deal.nextAction.replace(' - Send reminder', '')}
              </span>
            </div>
            {shouldShowKYCReminder() && (
              <button
                onClick={handleSendKYCReminder}
                disabled={sendingReminder}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center text-sm"
              >
                <Bell className="w-4 h-4 mr-2" />
                {sendingReminder ? 'Sending...' : 'Send Reminder'}
              </button>
            )}
          </div>
        </div>

        {/* Next Steps Guide */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
          <div className="space-y-3">
            {deal.status === 'accepted' && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Seller KYC:</strong> Seller must complete identity verification (mandatory)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">2</span>
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Document Upload:</strong> Upload ownership/authenticity documents
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">3</span>
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Payment Deposit:</strong> Buyer deposits funds into secure escrow
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">4</span>
                  </div>
                  <span className="text-sm text-gray-700">
                    <strong>Delivery & Confirmation:</strong> Item delivery and buyer confirmation
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {deal.canPerformActions?.acceptDeal && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-yellow-900">Action Required</h3>
                <p className="text-yellow-800">You need to accept this deal to proceed.</p>
              </div>
              <button
                onClick={handleAcceptDeal}
                disabled={acceptingDeal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {acceptingDeal ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Accepting...
                  </>
                ) : (
                  'Accept Deal'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'timeline', label: 'Timeline', icon: Clock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Deal Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold text-green-600">₹{deal.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{deal.category.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Method:</span>
                        <span className="font-medium">{deal.deliveryMethod.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inspection Period:</span>
                        <span className="font-medium">{deal.inspectionPeriod} days</span>
                      </div>
                    </div>
                  </div>

                  {/* Parties Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Parties</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Buyer: {deal.buyer.fullName}</div>
                          <div className="text-sm text-gray-500">{deal.buyer.userType} account</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Seller: {deal.seller.fullName}</div>
                          <div className="text-sm text-gray-500">{deal.seller.userType} account</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{deal.description}</p>
                </div>

                {/* Additional Terms */}
                {deal.additionalTerms && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Terms</h3>
                    <p className="text-gray-700 leading-relaxed">{deal.additionalTerms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                
                {/* Messages List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {deal.messages && deal.messages.length > 0 ? (
                    deal.messages.map((message: any, index: number) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.isSystemMessage 
                            ? 'justify-center' 
                            : message.sender._id === user?.id 
                              ? 'justify-end' 
                              : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isSystemMessage
                              ? 'bg-gray-100 text-gray-700 text-center text-sm'
                              : message.sender._id === user?.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {!message.isSystemMessage && (
                            <div className="text-sm font-medium mb-1">
                              {message.sender._id === user?.id ? 'You' : message.sender.fullName}
                            </div>
                          )}
                          <div>{message.message}</div>
                          <div className={`text-xs mt-1 ${message.isSystemMessage ? 'text-gray-500' : 'opacity-75'}`}>
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Send Message */}
                <div className="border-t pt-4">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </button>
                </div>
                
                {deal.documents && deal.documents.length > 0 ? (
                  <div className="space-y-3">
                    {deal.documents.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <div className="font-medium">{doc.fileName}</div>
                            <div className="text-sm text-gray-500">
                              Uploaded by {doc.uploadedBy.fullName} on {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.verified && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          <button className="p-2 text-gray-500 hover:text-gray-700">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No documents uploaded yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Deal Timeline</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Deal Created</div>
                      <div className="text-sm text-gray-500">{new Date(deal.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  {deal.workflow?.partiesAccepted?.completed && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Deal Accepted</div>
                        <div className="text-sm text-gray-500">
                          {new Date(deal.workflow.partiesAccepted.completedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Add more timeline events based on workflow status */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailsPage;