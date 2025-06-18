import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  Upload,
  Download,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  Send,
  Flag,
  Star,
  Eye,
  Package,
  Truck,
  CreditCard,
  X,
  RefreshCw
} from 'lucide-react';
import { dealService, Deal } from '../services/dealService';
import { useAuth } from '../context/AuthContext';
import FileUpload, { UploadResult } from '../components/FileUpload';

const DealDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  
  // Message form
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Payment form
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [transactionId, setTransactionId] = useState('');
  
  // Delivery form
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryProof, setDeliveryProof] = useState<File[]>([]);

  useEffect(() => {
    if (id) {
      fetchDeal();
    }
  }, [id]);

  const fetchDeal = async (showRefreshIndicator = false) => {
    if (!id) return;
    
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');
      
      const response = await dealService.getDeal(id);
      if (response.success) {
        setDeal(response.data.deal);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load deal details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDeal(true);
  };

  const handleAcceptDeal = async () => {
    if (!deal) return;
    
    try {
      setActionLoading(prev => ({ ...prev, accept: true }));
      setError('');
      
      const response = await dealService.acceptDeal(deal.id);
      if (response.success) {
        setSuccessMessage('Deal accepted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchDeal();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept deal');
    } finally {
      setActionLoading(prev => ({ ...prev, accept: false }));
    }
  };

  const handleDepositPayment = async () => {
    if (!deal) return;
    
    try {
      setActionLoading(prev => ({ ...prev, payment: true }));
      setError('');
      
      const response = await dealService.depositPayment(deal.id, {
        paymentMethod,
        transactionId: transactionId || undefined
      });
      
      if (response.success) {
        setSuccessMessage('Payment deposited successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchDeal();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deposit payment');
    } finally {
      setActionLoading(prev => ({ ...prev, payment: false }));
    }
  };

  const handleMarkDelivered = async () => {
    if (!deal) return;
    
    try {
      setActionLoading(prev => ({ ...prev, delivery: true }));
      setError('');
      
      // For demo purposes, we'll call a mark delivered endpoint
      // In a real implementation, this would be in the dealService
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/deals/${deal.id}/mark-delivered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deliveryNotes,
          deliveryMethod: deal.deliveryMethod
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Item marked as delivered!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchDeal();
      } else {
        throw new Error(data.message || 'Failed to mark as delivered');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mark as delivered');
    } finally {
      setActionLoading(prev => ({ ...prev, delivery: false }));
    }
  };

  const handleConfirmReceipt = async () => {
    if (!deal) return;
    
    try {
      setActionLoading(prev => ({ ...prev, confirm: true }));
      setError('');
      
      // For demo purposes, we'll call a confirm receipt endpoint
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/deals/${deal.id}/confirm-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: 5, // Default rating
          feedback: 'Transaction completed successfully'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Receipt confirmed! Deal completed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchDeal();
      } else {
        throw new Error(data.message || 'Failed to confirm receipt');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm receipt');
    } finally {
      setActionLoading(prev => ({ ...prev, confirm: false }));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal || !newMessage.trim()) return;
    
    try {
      setIsSendingMessage(true);
      setError('');
      
      const response = await dealService.addMessage(deal.id, newMessage.trim());
      if (response.success) {
        setNewMessage('');
        fetchDeal(); // Refresh to get new message
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendKYCReminder = async () => {
    if (!deal) return;
    
    try {
      setActionLoading(prev => ({ ...prev, kycReminder: true }));
      setError('');
      
      const response = await dealService.sendKYCReminder(deal.id);
      if (response.success) {
        setSuccessMessage('KYC reminder sent successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send KYC reminder');
    } finally {
      setActionLoading(prev => ({ ...prev, kycReminder: false }));
    }
  };

  const handleDocumentUpload = async (result: UploadResult, documentType: string) => {
    if (result.success) {
      setSuccessMessage(`${documentType} uploaded successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchDeal(); // Refresh to get updated documents
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'funds_deposited':
      case 'in_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'created':
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800';
      case 'kyc_pending':
      case 'documents_pending':
      case 'payment_pending':
      case 'contract_pending':
        return 'bg-orange-100 text-orange-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'funds_deposited':
      case 'in_delivery':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'disputed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderActionButton = () => {
    if (!deal) return null;

    const userRole = deal.role;
    const canAccept = deal.canPerformActions?.acceptDeal;
    const canDeposit = deal.canPerformActions?.depositPayment;
    const canMarkDelivered = deal.canPerformActions?.markDelivered;
    const canConfirm = deal.canPerformActions?.confirmReceipt;

    if (canAccept) {
      return (
        <button
          onClick={handleAcceptDeal}
          disabled={actionLoading.accept}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {actionLoading.accept ? 'Accepting...' : 'Accept Deal'}
        </button>
      );
    }

    if (canDeposit) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Deposit Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter transaction ID"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">₹{deal.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDepositPayment}
            disabled={actionLoading.payment}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {actionLoading.payment ? 'Processing...' : 'Deposit Payment'}
          </button>
        </div>
      );
    }

    if (canMarkDelivered) {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">Mark as Delivered</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Notes
              </label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Add any delivery notes or instructions..."
              />
            </div>
          </div>
          <button
            onClick={handleMarkDelivered}
            disabled={actionLoading.delivery}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Package className="w-5 h-5 mr-2" />
            {actionLoading.delivery ? 'Marking...' : 'Mark as Delivered'}
          </button>
        </div>
      );
    }

    if (canConfirm) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Confirm Receipt</h3>
            <p className="text-blue-800 text-sm">
              Please confirm that you have received the item/service and are satisfied with the transaction.
              This will release the funds to the seller.
            </p>
          </div>
          <button
            onClick={handleConfirmReceipt}
            disabled={actionLoading.confirm}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {actionLoading.confirm ? 'Confirming...' : 'Confirm Receipt & Release Funds'}
          </button>
        </div>
      );
    }

    // KYC reminder for counterparty
    if (deal.nextAction.includes('KYC') && deal.nextAction.includes('reminder')) {
      return (
        <button
          onClick={handleSendKYCReminder}
          disabled={actionLoading.kycReminder}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center disabled:opacity-50"
        >
          <Mail className="w-5 h-5 mr-2" />
          {actionLoading.kycReminder ? 'Sending...' : 'Send KYC Reminder'}
        </button>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Deal Not Found</h1>
            <p className="text-gray-600 mb-6">The deal you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
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
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${getStatusColor(deal.status)}`}>
                {getStatusIcon(deal.status)}
                <span className="font-medium">{formatStatus(deal.status)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-700">{successMessage}</p>
              </div>
              <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Deal Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount and Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-3xl font-bold text-gray-900">₹{deal.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Transaction Amount</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">{deal.progress}%</div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{deal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${deal.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-700">Next: {deal.nextAction}</span>
              </div>
            </div>

            {/* Action Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Action</h3>
              {renderActionButton()}
            </div>

            {/* Deal Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{deal.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                    <p className="text-gray-700 capitalize">{deal.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Delivery Method</h4>
                    <p className="text-gray-700 capitalize">{deal.deliveryMethod.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Inspection Period</h4>
                    <p className="text-gray-700">{deal.inspectionPeriod} days</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Escrow Fee</h4>
                    <p className="text-gray-700">₹{deal.escrowFee.toLocaleString()} ({deal.escrowFeePercentage}%)</p>
                  </div>
                </div>

                {deal.additionalTerms && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Terms</h4>
                    <p className="text-gray-700">{deal.additionalTerms}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Parties */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Parties</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Buyer</div>
                    <div className="text-sm text-gray-600">{deal.buyer.fullName}</div>
                    {deal.buyer.rating.count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{deal.buyer.rating.average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Seller</div>
                    <div className="text-sm text-gray-600">{deal.seller.fullName}</div>
                    {deal.seller.rating.count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{deal.seller.rating.average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('messages')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Send Message</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('documents')}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>View Documents</span>
                </button>
                
                <Link
                  to="/kyc"
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span>KYC Status</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
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
            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {deal.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.sender._id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender._id === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.sender.fullName}
                        </div>
                        <div>{message.message}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMessage || !newMessage.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {deal.documents.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{doc.documentType}</h4>
                          <p className="text-sm text-gray-600">{doc.fileName}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.verified && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Uploaded by {doc.uploadedBy.fullName} on{' '}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload new document */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Upload Document</h4>
                  <FileUpload
                    onUpload={(result) => handleDocumentUpload(result, 'other')}
                    onError={(error) => setError(error)}
                    documentType="other"
                  />
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {Object.entries(deal.workflow).map(([key, step]: [string, any], index) => (
                      <li key={key}>
                        <div className="relative pb-8">
                          {index !== Object.keys(deal.workflow).length - 1 && (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  step.completed
                                    ? 'bg-green-500'
                                    : 'bg-gray-400'
                                }`}
                              >
                                {step.completed ? (
                                  <CheckCircle className="w-5 h-5 text-white" />
                                ) : (
                                  <Clock className="w-5 h-5 text-white" />
                                )}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </p>
                                {step.completedAt && (
                                  <p className="text-xs text-gray-400">
                                    {new Date(step.completedAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {step.completed ? 'Completed' : 'Pending'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
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