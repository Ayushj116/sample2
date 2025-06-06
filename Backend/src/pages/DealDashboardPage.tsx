import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  TrendingUp
} from 'lucide-react';

const DealDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for deals
  const deals = [
    {
      id: 'ST001',
      title: 'Honda City 2019 Model',
      amount: 250000,
      status: 'funds-deposited',
      type: 'vehicle',
      counterparty: 'Riya Sharma',
      role: 'seller',
      createdAt: '2024-01-15',
      nextAction: 'Deliver vehicle to buyer',
      progress: 75
    },
    {
      id: 'ST002',
      title: '2BHK Apartment in Koramangala',
      amount: 5000000,
      status: 'kyc-pending',
      type: 'real-estate',
      counterparty: 'Manoj Kumar',
      role: 'buyer',
      createdAt: '2024-01-10',
      nextAction: 'Complete KYC verification',
      progress: 25
    },
    {
      id: 'ST003',
      title: 'Website Development Project',
      amount: 75000,
      status: 'completed',
      type: 'freelancing',
      counterparty: 'Tech Solutions Pvt Ltd',
      role: 'seller',
      createdAt: '2024-01-05',
      nextAction: 'Deal completed',
      progress: 100
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'funds-deposited':
        return 'bg-blue-100 text-blue-800';
      case 'kyc-pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'funds-deposited':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'kyc-pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'disputed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.counterparty.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'active') {
      return matchesSearch && deal.status !== 'completed';
    } else if (activeTab === 'completed') {
      return matchesSearch && deal.status === 'completed';
    }
    
    return matchesSearch;
  });

  const stats = [
    { label: 'Active Deals', value: '2', icon: Clock, color: 'text-blue-600' },
    { label: 'Completed Deals', value: '1', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Total Value', value: '₹53L', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Success Rate', value: '100%', icon: Shield, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                            {deal.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Deal ID: {deal.id}</span>
                          <span>•</span>
                          <span>Role: {deal.role}</span>
                          <span>•</span>
                          <span>With: {deal.counterparty}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">₹{deal.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Created: {deal.createdAt}</div>
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
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Eye className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <MessageSquare className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="w-5 h-5 text-gray-500" />
                    </button>
                    <Link
                      to={`/deal/${deal.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
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