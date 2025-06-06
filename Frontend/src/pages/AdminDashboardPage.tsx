import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye,
  MessageSquare,
  Flag,
  User,
  Shield,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  X
} from 'lucide-react';
import { adminService, AdminDashboardData, FlaggedDeal, KYCReview } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [flaggedDeals, setFlaggedDeals] = useState<FlaggedDeal[]>([]);
  const [kycReviews, setKycReviews] = useState<KYCReview[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const { user } = useAuth();

  useEffect(() => {
    if (user?.isAdmin) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'flagged') {
      fetchFlaggedDeals();
    } else if (activeTab === 'kyc') {
      fetchKYCReviews();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getDashboardData();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFlaggedDeals = async () => {
    try {
      const response = await adminService.getFlaggedDeals();
      if (response.success) {
        setFlaggedDeals(response.data.deals);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load flagged deals');
    }
  };

  const fetchKYCReviews = async () => {
    try {
      const response = await adminService.getKYCReviews();
      if (response.success) {
        setKycReviews(response.data.reviews);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load KYC reviews');
    }
  };

  const handleKYCAction = async (kycId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [kycId]: true }));
      await adminService.reviewKYC(kycId, action, notes);
      fetchKYCReviews(); // Refresh the list
      setSelectedItem(null);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} KYC`);
    } finally {
      setActionLoading(prev => ({ ...prev, [kycId]: false }));
    }
  };

  const handleDealAction = async (dealId: string, action: 'approve' | 'flag' | 'investigate', notes?: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [dealId]: true }));
      await adminService.reviewDeal(dealId, action, notes);
      fetchFlaggedDeals(); // Refresh the list
      setSelectedItem(null);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} deal`);
    } finally {
      setActionLoading(prev => ({ ...prev, [dealId]: false }));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFlagIcon = (flag: string) => {
    switch (flag) {
      case 'high-value':
        return <DollarSign className="w-4 h-4" />;
      case 'multiple-deals':
        return <Flag className="w-4 h-4" />;
      case 'unusual-category':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Monitor transactions, review KYC, and manage platform security</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {flaggedDeals.length} Flagged
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {kycReviews.filter(k => k.status === 'pending').length} Pending KYC
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deals</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData.stats.activeDeals}</p>
                  <p className="text-sm text-green-600 mt-1">+12%</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData.stats.totalVolume}</p>
                  <p className="text-sm text-green-600 mt-1">+8.5%</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData.stats.newUsers}</p>
                  <p className="text-sm text-green-600 mt-1">+15%</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData.stats.successRate}</p>
                  <p className="text-sm text-green-600 mt-1">+0.3%</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'flagged', label: 'Flagged Deals', icon: Flag },
                { id: 'kyc', label: 'KYC Reviews', icon: User },
                { id: 'transactions', label: 'All Transactions', icon: FileText }
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
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search transactions, users..."
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

            {/* Overview Tab */}
            {activeTab === 'overview' && dashboardData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {dashboardData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{activity.details}</span>
                          <span className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platform Health */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Platform Health</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">System Status</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-600">Operational</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Payment Gateway</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-600">Online</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">KYC Service</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-600">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Flagged Deals Tab */}
            {activeTab === 'flagged' && (
              <div className="space-y-4">
                {flaggedDeals.map((deal) => (
                  <div key={deal.id} className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(deal.severity)}`}>
                            {deal.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div>Deal ID: {deal.dealId}</div>
                          <div>Amount: ₹{deal.amount.toLocaleString()}</div>
                          <div>Flagged: {new Date(deal.flaggedAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Buyer: {deal.buyer}</span>
                          <span>•</span>
                          <span>Seller: {deal.seller}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {getFlagIcon(deal.flag)}
                          <span className="text-sm font-medium text-gray-700">
                            Flag: {deal.flag.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button 
                          onClick={() => setSelectedItem(deal)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                        >
                          <Eye className="w-5 h-5 text-gray-500" />
                        </button>
                        <button 
                          onClick={() => handleDealAction(deal.id, 'approve')}
                          disabled={actionLoading[deal.id]}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading[deal.id] ? 'Processing...' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => handleDealAction(deal.id, 'investigate')}
                          disabled={actionLoading[deal.id]}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading[deal.id] ? 'Processing...' : 'Investigate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KYC Reviews Tab */}
            {activeTab === 'kyc' && (
              <div className="space-y-4">
                {kycReviews.map((kyc) => (
                  <div key={kyc.id} className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{kyc.user}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {kyc.type.toUpperCase()} KYC
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {kyc.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>KYC ID: {kyc.id}</div>
                          <div>Submitted: {new Date(kyc.submittedAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            Documents: {kyc.documents.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button 
                          onClick={() => setSelectedItem(kyc)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                        >
                          <Eye className="w-5 h-5 text-gray-500" />
                        </button>
                        <button 
                          onClick={() => handleKYCAction(kyc.id, 'approve')}
                          disabled={actionLoading[kyc.id]}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {actionLoading[kyc.id] ? 'Processing...' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => handleKYCAction(kyc.id, 'reject')}
                          disabled={actionLoading[kyc.id]}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading[kyc.id] ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deal ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ST001
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Honda City 2019 Model
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹2,50,000
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            ACTIVE
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2024-01-15
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                          <button className="text-gray-600 hover:text-gray-900">Edit</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal for viewing details */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedItem.title || selectedItem.user} Details
                </h3>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedItem, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;