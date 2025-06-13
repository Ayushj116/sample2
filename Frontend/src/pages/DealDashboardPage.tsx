import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Download,
  MessageSquare,
  Shield,
  TrendingUp,
  X
} from 'lucide-react';
import { dealService, Deal } from '../services/dealService';
import { useAuth } from '../context/AuthContext';

const DealDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Show success message if redirected from create deal
  const successMessage = location.state?.message;

  useEffect(() => {
    fetchDeals();
  }, [activeTab, searchTerm]);

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params: any = {
        page: 1,
        limit: 10
      };
      
      if (activeTab === 'active') {
        params.status = 'created,accepted,kyc_pending,documents_pending,payment_pending,contract_pending,funds_deposited,in_delivery,delivered';
      } else if (activeTab === 'completed') {
        params.status = 'completed';
      }
      
      const response = await dealService.getDeals(params);
      
      if (response.success) {
        let filteredDeals = response.data.deals;
        
        // Apply search filter
        if (searchTerm) {
          filteredDeals = filteredDeals.filter(deal => 
            deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.dealId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (deal.buyer.fullName && deal.buyer.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (deal.seller.fullName && deal.seller.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        setDeals(filteredDeals);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDeal = (dealId: string) => {
    // Navigate to deal details page
    navigate(`/deal/${dealId}`);
  };

  const handleDownloadDeal = (deal: Deal) => {
    // Generate and download deal summary
    const dealSummary = `
Deal Summary
============
Deal ID: ${deal.dealId}
Title: ${deal.title}
Amount: ₹${deal.amount.toLocaleString()}
Status: ${deal.status}
Buyer: ${deal.buyer.fullName}
Seller: ${deal.seller.fullName}
Created: ${new Date(deal.createdAt).toLocaleDateString()}
Progress: ${deal.progress}%

Next Action: ${deal.nextAction}
    `;

    const blob = new Blob([dealSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deal-${deal.dealId}-summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMessageDeal = (dealId: string) => {
    // Navigate to deal details with message tab active
    navigate(`/deal/${dealId}?tab=messages`);
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

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.dealId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'active') {
      return matchesSearch && !['completed', 'cancelled', 'refunded'].includes(deal.status);
    } else if (activeTab === 'completed') {
      return matchesSearch && ['completed', 'cancelled', 'refunded'].includes(deal.status);
    }
    
    return matchesSearch;
  });

  const stats = [
    { 
      label: 'Active Deals', 
      value: deals.filter(d => !['completed', 'cancelled', 'refunded'].includes(d.status)).length.toString(), 
      icon: Clock, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Completed Deals', 
      value: deals.filter(d => d.status === 'completed').length.toString(), 
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      label: 'Total Value', 
      value: `₹${(deals.reduce((sum, deal) => sum + deal.amount, 0) / 100000).toFixed(0)}L`, 
      icon: TrendingUp, 
      color: 'text-purple-600' 
    },
    { 
      label: 'Success Rate', 
      value: deals.length > 0 ? `${Math.round((deals.filter(d => d.status === 'completed').length / deals.length) * 100)}%` : '0%', 
      icon: Shield, 
      color: 'text-orange-600' 
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-700">{successMessage}</p>
              </div>
              <button 
                onClick={() => window.history.replaceState({}, '', window.location.pathname)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Deal Dashboard</h1>
              <p className="text-gray-600">Monitor and manage all your escrow transactions</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/create-deal"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Deal
              </Link>
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Deals
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Search */}
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Deals List */}
        <div className="space-y-4">
          {filteredDeals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Shield className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No deals found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Start your first secure transaction today'}
              </p>
              <Link
                to="/create-deal"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Deal
              </Link>
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                            {formatStatus(deal.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Deal ID: {deal.dealId}</span>
                          <span>•</span>
                          <span>Role: {deal.role}</span>
                          <span>•</span>
                          <span>With: {deal.role === 'buyer' ? deal.seller.fullName : deal.buyer.fullName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">₹{deal.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Created: {new Date(deal.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{deal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${deal.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Next Action */}
                    <div className="flex items-center space-x-2 mb-4">
                      {getStatusIcon(deal.status)}
                      <span className="text-sm font-medium text-gray-700">Next: {deal.nextAction}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 mt-4 lg:mt-0 lg:ml-6">
                    <button 
                      onClick={() => handleViewDeal(deal.id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => handleMessageDeal(deal.id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Send Message"
                    >
                      <MessageSquare className="w-5 h-5 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => handleDownloadDeal(deal)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Download Summary"
                    >
                      <Download className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleViewDeal(deal.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDashboardPage;