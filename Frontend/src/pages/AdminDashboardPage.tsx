import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for admin dashboard
  const stats = [
    { label: 'Active Deals', value: '145', change: '+12%', icon: Clock, color: 'text-blue-600' },
    { label: 'Total Volume', value: '₹2.3Cr', change: '+8.5%', icon: DollarSign, color: 'text-green-600' },
    { label: 'New Users', value: '89', change: '+15%', icon: Users, color: 'text-purple-600' },
    { label: 'Success Rate', value: '99.2%', change: '+0.3%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const flaggedDeals = [
    {
      id: 'ST001',
      title: 'Luxury Car Sale - BMW X5',
      amount: 2500000,
      flag: 'high-value',
      severity: 'medium',
      buyer: 'Ravi Kumar',
      seller: 'Auto Dealership Ltd',
      flaggedAt: '2024-01-15 14:30'
    },
    {
      id: 'ST002',
      title: 'Multiple Property Purchase',
      amount: 15000000,
      flag: 'multiple-deals',
      severity: 'high',
      buyer: 'Investment Group',
      seller: 'Property Developer',
      flaggedAt: '2024-01-15 12:15'
    },
    {
      id: 'ST003',
      title: 'Cryptocurrency Mining Equipment',
      amount: 500000,
      flag: 'unusual-category',
      severity: 'low',
      buyer: 'Tech Startup',
      seller: 'Hardware Supplier',
      flaggedAt: '2024-01-15 09:45'
    }
  ];

  const kycReviews = [
    {
      id: 'KYC001',
      user: 'Priya Sharma',
      type: 'personal',
      status: 'pending',
      submittedAt: '2024-01-15 16:20',
      documents: ['PAN', 'Aadhaar', 'Bank Statement']
    },
    {
      id: 'KYC002',
      user: 'Mumbai Traders Pvt Ltd',
      type: 'business',
      status: 'review',
      submittedAt: '2024-01-15 14:45',
      documents: ['GST Certificate', 'Registration', 'Bank Statement']
    }
  ];

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
                3 Flagged
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                2 Pending KYC
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

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
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Deal ST001 completed successfully</span>
                        <span className="text-xs text-gray-500">2 min ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">KYC review pending for user KYC001</span>
                        <span className="text-xs text-gray-500">5 min ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">High-value deal flagged for review</span>
                        <span className="text-xs text-gray-500">12 min ago</span>
                      </div>
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
                          <div>Deal ID: {deal.id}</div>
                          <div>Amount: ₹{deal.amount.toLocaleString()}</div>
                          <div>Flagged: {deal.flaggedAt}</div>
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
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                          <Eye className="w-5 h-5 text-gray-500" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                          <MessageSquare className="w-5 h-5 text-gray-500" />
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          Review
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
                          <div>Submitted: {kyc.submittedAt}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            Documents: {kyc.documents.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                          <Eye className="w-5 h-5 text-gray-500" />
                        </button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                          Reject
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
      </div>
    </div>
  );
};

export default AdminDashboardPage;