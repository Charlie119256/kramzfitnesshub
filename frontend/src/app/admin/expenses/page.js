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
  ChartPieIcon
} from '@heroicons/react/24/outline';
import ResponsiveAlert from '@/components/common/ResponsiveAlert';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category_id: '',
    status: ''
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
      
      // Build query parameters for expenses
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.status) params.append('status', filters.status);
      
      // Fetch expenses and analytics in parallel
      const [expensesResponse, analyticsResponse, trendsResponse, forecastResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/expenses?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/expenses/analytics?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/expenses/trends/analysis`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/expenses/forecast/prediction`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (expensesResponse.ok && analyticsResponse.ok && trendsResponse.ok && forecastResponse.ok) {
        const expensesData = await expensesResponse.json();
        const analyticsData = await analyticsResponse.json();
        const trendsData = await trendsResponse.json();
        const forecastData = await forecastResponse.json();
        
        setExpenses(expensesData);
        setAnalytics(analyticsData);
        setTrends(trendsData);
        setForecast(forecastData);
      } else {
        setError('Failed to fetch expenses data');
      }
    } catch (error) {
      setError('Failed to fetch expenses data');
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
      category_id: '',
      status: ''
    });
    setLoading(true);
    fetchData();
  };

  const openDetailsModal = (expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'under_maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'under_maintenance':
        return <CogIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
  const totalExpenses = analytics?.totalExpenses || 0;
  const totalItems = expenses.length;
  const averageExpense = totalItems > 0 ? totalExpenses / totalItems : 0;
  const percentageChange = trends?.percentageChange || 0;

  // Show loading while checking authentication
  if (checkingAuth) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading Expenses Data..." />;
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
              <h1 className="text-3xl font-bold text-gray-900">Expenses Management</h1>
              <p className="text-gray-600 mt-1">Kramz Fitness Hub - Equipment Expenses Analytics</p>
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
                <CurrencyDollarIcon className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CogIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Expense</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageExpense)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  percentageChange >= 0 ? 'bg-red-100' : 'bg-green-100'
                }`}>
                                     {percentageChange >= 0 ? (
                     <ArrowTrendingUpIcon className="h-4 w-4 text-red-600" />
                   ) : (
                     <ArrowTrendingDownIcon className="h-4 w-4 text-green-600" />
                   )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">YoY Change</p>
                  <p className={`text-2xl font-bold ${
                    percentageChange >= 0 ? 'text-red-600' : 'text-green-600'
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="under_maintenance">Under Maintenance</option>
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
              {/* Expenses by Category */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ChartPieIcon className="h-5 w-5 mr-2" />
                    Expenses by Category
                  </h3>
                </div>
                <div className="p-6">
                  {analytics.expensesByCategory && analytics.expensesByCategory.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.expensesByCategory.map((category, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{category.category_name || 'Uncategorized'}</p>
                            <p className="text-sm text-gray-500">{category.item_count} items</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(category.total_amount)}</p>
                            <p className="text-sm text-gray-500">
                              {((category.total_amount / totalExpenses) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No category data available</p>
                  )}
                </div>
              </div>

              {/* Monthly Expenses */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Monthly Expenses ({new Date().getFullYear()})
                  </h3>
                </div>
                <div className="p-6">
                  {analytics.monthlyExpenses && analytics.monthlyExpenses.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.monthlyExpenses.map((month, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{getMonthName(month.month)}</p>
                            <p className="text-sm text-gray-500">{month.item_count} items</p>
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
                            trends.percentageChange >= 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {trends.percentageChange >= 0 ? '+' : ''}{trends.percentageChange.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Expense Forecast */}
              {forecast && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      Expense Forecast
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Average Monthly Expense</span>
                        <span className="font-bold text-gray-900">{formatCurrency(forecast.averageMonthlyExpense)}</span>
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

          {/* Expenses Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Equipment Expenses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchase Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.equipment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{expense.name}</div>
                        <div className="text-sm text-gray-500">Qty: {expense.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(expense.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(expense.purchase_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                          {getStatusIcon(expense.status)}
                          <span className="ml-1">{expense.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDetailsModal(expense)}
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

      {/* Expense Details Modal */}
      {showDetailsModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Expense Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Equipment Information</h4>
                <p className="text-sm text-gray-600">Name: {selectedExpense.name}</p>
                <p className="text-sm text-gray-600">Category: {selectedExpense.category?.name || 'Uncategorized'}</p>
                <p className="text-sm text-gray-600">Quantity: {selectedExpense.quantity}</p>
                <p className="text-sm text-gray-600">Condition: {selectedExpense.condition || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Purchase Information</h4>
                <p className="text-sm text-gray-600">Price: {formatCurrency(selectedExpense.price)}</p>
                <p className="text-sm text-gray-600">Purchase Date: {formatDate(selectedExpense.purchase_date)}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Status</h4>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedExpense.status)}`}>
                  {getStatusIcon(selectedExpense.status)}
                  <span className="ml-1">{selectedExpense.status.replace('_', ' ')}</span>
                </span>
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