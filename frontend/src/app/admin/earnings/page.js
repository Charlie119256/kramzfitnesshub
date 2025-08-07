'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '../../../components/admin/AdminNavbar';
import { 
  ExclamationTriangleIcon, 
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowPathIcon,
  CogIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartPieIcon,
  CreditCardIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import ResponsiveAlert from '@/components/common/ResponsiveAlert';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function EarningsPage() {
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [earnings, setEarnings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    membership_id: '',
    payment_method: ''
  });

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || !userRole) {
      // Not authenticated, redirect to login
      router.push('/login');
      return;
    }
    
    // Check if user has admin role
    if (userRole !== 'admin') {
      // Wrong role, redirect to appropriate dashboard
      switch (userRole) {
        case 'clerk':
          router.push('/clerk');
          break;
        case 'member':
          router.push('/member');
          break;
        default:
          router.push('/login');
      }
      return;
    }
    
    setCheckingAuth(false);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Build query parameters for earnings
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.membership_id) params.append('membership_id', filters.membership_id);
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      
      // Fetch earnings and analytics in parallel
      const [earningsResponse, analyticsResponse, trendsResponse, forecastResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/earnings?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/earnings/analytics?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/earnings/trends/analysis`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/earnings/forecast/prediction`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (earningsResponse.ok && analyticsResponse.ok && trendsResponse.ok && forecastResponse.ok) {
        const earningsData = await earningsResponse.json();
        const analyticsData = await analyticsResponse.json();
        const trendsData = await trendsResponse.json();
        const forecastData = await forecastResponse.json();
        
        setEarnings(earningsData);
        setAnalytics(analyticsData);
        setTrends(trendsData);
        setForecast(forecastData);
      } else {
        setError('Failed to fetch earnings data');
      }
    } catch (error) {
      setError('Failed to fetch earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchData();
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      membership_id: '',
      payment_method: ''
    });
    setLoading(true);
    fetchData();
  };

  const openDetailsModal = (earning) => {
    setSelectedEarning(earning);
    setShowDetailsModal(true);
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || month;
  };

  // Calculate statistics
  const totalEarnings = analytics?.totalEarnings || 0;
  const totalTransactions = earnings.length;
  const averageEarning = totalTransactions > 0 ? totalEarnings / totalTransactions : 0;
  const percentageChange = trends?.percentageChange || 0;

  // Show loading while checking authentication
  if (checkingAuth) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading Earnings Data..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar adminName="Admin" />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Earnings Management</h1>
              <p className="text-gray-600 mt-1">Kramz Fitness Hub - Membership Earnings Analytics</p>
            </div>
            <button
              onClick={fetchData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Transaction</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageEarning)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  percentageChange >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {percentageChange >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">YoY Change</p>
                  <p className={`text-2xl font-bold ${
                    percentageChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={filters.payment_method}
                    onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Methods</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    onClick={handleApplyFilters}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Earnings by Membership Type */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ChartPieIcon className="h-5 w-5 mr-2" />
                    Earnings by Membership Type
                  </h3>
                </div>
                <div className="p-6">
                  {analytics.earningsByMembershipType && analytics.earningsByMembershipType.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.earningsByMembershipType.map((type, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{type.membership_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{type.transaction_count} transactions</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(type.total_amount)}</p>
                            <p className="text-sm text-gray-500">
                              {((type.total_amount / totalEarnings) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No membership type data available</p>
                  )}
                </div>
              </div>

              {/* Monthly Earnings */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Monthly Earnings ({new Date().getFullYear()})
                  </h3>
                </div>
                <div className="p-6">
                  {analytics.monthlyEarnings && analytics.monthlyEarnings.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.monthlyEarnings.map((month, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{getMonthName(month.month)}</p>
                            <p className="text-sm text-gray-500">{month.transaction_count} transactions</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(month.total_amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No monthly data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trends and Forecast Section */}
          {(trends || forecast) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Year-over-Year Trends */}
              {trends && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                      Year-over-Year Trends
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Current Year ({trends.currentYear})</span>
                        <span className="font-bold text-gray-900">{formatCurrency(trends.currentYearTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Previous Year ({trends.previousYear})</span>
                        <span className="font-bold text-gray-900">{formatCurrency(trends.previousYearTotal)}</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Change</span>
                          <span className={`font-bold ${
                            trends.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trends.percentageChange >= 0 ? '+' : ''}{trends.percentageChange.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Earnings Forecast */}
              {forecast && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      Earnings Forecast
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Average Monthly Earnings</span>
                        <span className="font-bold text-gray-900">{formatCurrency(forecast.averageMonthlyEarnings)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Confidence Level</span>
                        <span className="font-bold text-gray-900">{(forecast.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600 mb-2">Next 6 Months Forecast:</p>
                        {forecast.forecast && forecast.forecast.slice(0, 6).map((month, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{month.monthName}</span>
                            <span className="font-medium text-gray-900">{formatCurrency(month.predictedAmount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Earnings Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Earnings Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membership Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {earnings.map((earning) => (
                    <tr key={earning.receipt_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {earning.memberMembership?.member?.first_name} {earning.memberMembership?.member?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {earning.memberMembership?.member?.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {earning.memberMembership?.membershipType?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(earning.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(earning.payment_method)}`}>
                          {getPaymentMethodIcon(earning.payment_method)}
                          <span className="ml-1">{earning.payment_method}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(earning.issued_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDetailsModal(earning)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Details Modal */}
      {showDetailsModal && selectedEarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Member Information</h4>
                <p className="text-sm text-gray-600">
                  Name: {selectedEarning.memberMembership?.member?.first_name} {selectedEarning.memberMembership?.member?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {selectedEarning.memberMembership?.member?.user?.email}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Membership Plan</h4>
                <p className="text-sm text-gray-600">
                  Plan: {selectedEarning.memberMembership?.membershipType?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {selectedEarning.memberMembership?.membershipType?.duration_days} days
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Payment Information</h4>
                <p className="text-sm text-gray-600">
                  Amount: {formatCurrency(selectedEarning.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  Method: {selectedEarning.payment_method}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {formatDate(selectedEarning.issued_at)}
                </p>
                {selectedEarning.reference_number && (
                  <p className="text-sm text-gray-600">
                    Reference: {selectedEarning.reference_number}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Alert */}
      <ResponsiveAlert
        success={success}
        error={error}
        onSuccessClose={() => setSuccess('')}
        onErrorClose={() => setError('')}
        fullScreen={false}
      />
    </div>
  );
} 