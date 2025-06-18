import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Filter,
  Search,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release';
  amount: number;
  description: string;
  dealId?: string;
  dealTitle?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  transactionId: string;
  counterparty?: string;
}

interface WalletBalance {
  available: number;
  escrow: number;
  total: number;
}

const WalletPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    available: 0,
    escrow: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  const { user } = useAuth();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - replace with actual API calls
      const mockBalance: WalletBalance = {
        available: 125000,
        escrow: 56798,
        total: 181798
      };

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'escrow_hold',
          amount: 56798,
          description: 'Funds held in escrow',
          dealId: 'STMC1TDNC20N8Q9',
          dealTitle: 'Honda City 2019 Model',
          status: 'completed',
          createdAt: '2024-06-18T10:30:00Z',
          transactionId: 'TXN1234567890',
          counterparty: 'Shivam Jindal'
        },
        {
          id: '2',
          type: 'credit',
          amount: 250000,
          description: 'Deal completion - funds released',
          dealId: 'ST001',
          dealTitle: 'MacBook Pro M3',
          status: 'completed',
          createdAt: '2024-06-15T14:20:00Z',
          transactionId: 'REL1234567891',
          counterparty: 'Rahul Sharma'
        },
        {
          id: '3',
          type: 'debit',
          amount: 2500,
          description: 'Escrow service fee',
          status: 'completed',
          createdAt: '2024-06-15T14:20:00Z',
          transactionId: 'FEE1234567892'
        },
        {
          id: '4',
          type: 'credit',
          amount: 150000,
          description: 'Deal completion - funds released',
          dealId: 'ST002',
          dealTitle: 'iPhone 15 Pro Max',
          status: 'completed',
          createdAt: '2024-06-10T09:15:00Z',
          transactionId: 'REL1234567893',
          counterparty: 'Priya Patel'
        },
        {
          id: '5',
          type: 'debit',
          amount: 1500,
          description: 'Escrow service fee',
          status: 'completed',
          createdAt: '2024-06-10T09:15:00Z',
          transactionId: 'FEE1234567894'
        }
      ];

      setWalletBalance(mockBalance);
      setTransactions(mockTransactions);

    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchWalletData(true);
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock className="w-5 h-5 text-yellow-600" />;
    if (status === 'failed') return <AlertCircle className="w-5 h-5 text-red-600" />;

    switch (type) {
      case 'credit':
      case 'escrow_release':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'debit':
      case 'escrow_hold':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'pending') return 'text-yellow-600';
    if (status === 'failed') return 'text-red-600';

    switch (type) {
      case 'credit':
      case 'escrow_release':
        return 'text-green-600';
      case 'debit':
      case 'escrow_hold':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'credit':
        return 'Money In';
      case 'debit':
        return 'Money Out';
      case 'escrow_hold':
        return 'Escrow Hold';
      case 'escrow_release':
        return 'Escrow Release';
      default:
        return type;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.dealTitle && transaction.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const downloadStatement = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Status', 'Transaction ID'],
      ...filteredTransactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        formatTransactionType(t.type),
        t.description,
        `₹${t.amount.toLocaleString()}`,
        t.status,
        t.transactionId
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-statement-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet & Payments</h1>
              <p className="text-gray-600">Track your balance, transactions, and payment history</p>
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
              
              <button
                onClick={downloadStatement}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Statement
              </button>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{walletBalance.available.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">Ready to use</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Escrow</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{walletBalance.escrow.toLocaleString()}</p>
                <p className="text-sm text-yellow-600 mt-1">Held securely</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{walletBalance.total.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">All funds</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="credit">Money In</option>
                <option value="debit">Money Out</option>
                <option value="escrow_hold">Escrow Hold</option>
                <option value="escrow_release">Escrow Release</option>
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'Your transaction history will appear here'}
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-gray-50">
                        {getTransactionIcon(transaction.type, transaction.status)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                          {transaction.dealId && (
                            <Link
                              to={`/deal/${transaction.dealId}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Deal
                            </Link>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{formatTransactionType(transaction.type)}</span>
                          <span>•</span>
                          <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>ID: {transaction.transactionId}</span>
                          {transaction.counterparty && (
                            <>
                              <span>•</span>
                              <span>With: {transaction.counterparty}</span>
                            </>
                          )}
                        </div>
                        
                        {transaction.dealTitle && (
                          <p className="text-sm text-gray-500 mt-1">Deal: {transaction.dealTitle}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getTransactionColor(transaction.type, transaction.status)}`}>
                        {transaction.type === 'credit' || transaction.type === 'escrow_release' ? '+' : '-'}
                        ₹{transaction.amount.toLocaleString()}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        {transaction.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {transaction.status === 'pending' && (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        )}
                        {transaction.status === 'failed' && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm capitalize ${
                          transaction.status === 'completed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/create-deal"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
            >
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Start New Deal</h4>
              <p className="text-sm text-gray-600">Create a secure escrow transaction</p>
            </Link>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Add Funds</h4>
              <p className="text-sm text-gray-600">Top up your wallet balance</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center">
              <Download className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Withdraw Funds</h4>
              <p className="text-sm text-gray-600">Transfer to your bank account</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;