'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  CogIcon,
  BellIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MegaphoneIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ResponsiveAlert from '@/components/common/ResponsiveAlert';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    target_audience: 'all'
  });
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

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
    
    // Fetch dashboard data
    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    // Clear stored data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    
    // Redirect to login page
    router.push('/login');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      console.log('adminToken:', token); // Debug log
      if (!token) {
        setError('Session expired or not logged in. Please log in again.');
        router.push('/login');
        return;
      }
      // Use Next.js proxy (relative URL)
      const response = await fetch('/api/admin-dashboard/dashboard-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'No token provided.') {
          setError('Session expired or not logged in. Please log in again.');
          router.push('/login');
          return;
        }
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmittingAnnouncement(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      // Use Next.js proxy (relative URL)
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(announcementForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create announcement');
      }

      const result = await response.json();
      setSuccess('Announcement created successfully!');
      setShowAnnouncementModal(false);
      setAnnouncementForm({ title: '', message: '', target_audience: 'all' });
      
      // Refresh dashboard data to show new announcement
      await fetchDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  const handleAnnouncementInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const {
    totalEarnings,
    totalMembersWithMembership,
    totalMemberAccounts,
    totalStaff,
    totalEquipment,
    expiringSoon,
    expiredMembers,
    membershipByGender,
    recentAnnouncements
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar adminName="Admin" />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    ₱{totalEarnings?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm mt-1 text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    +12.5% from last month
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500 text-white">
                  <CurrencyDollarIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Active Members
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {totalMembersWithMembership || 0}
                  </p>
                  <p className="text-sm mt-1 text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    +8.2% from last month
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500 text-white">
                  <UsersIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Total Staff
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {totalStaff || 0}
                  </p>
                  <p className="text-sm mt-1 text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    +2.1% from last month
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500 text-white">
                  <UsersIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Total Equipment
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {totalEquipment || 0}
                  </p>
                  <p className="text-sm mt-1 text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    +5.3% from last month
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-500 text-white">
                  <CogIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Earnings Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Monthly Earnings
              </h3>
              <div className="flex items-end justify-between h-48 space-x-2">
                {dashboardData.monthlyEarnings?.map((item, index) => {
                  const maxEarnings = Math.max(...dashboardData.monthlyEarnings.map(item => item.total || 0));
                  const height = maxEarnings > 0 ? ((item.total || 0) / maxEarnings) * 100 : 0;
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full bg-gray-200 rounded-t" style={{ height: `${height}%` }}>
                        <div 
                          className="bg-green-500 rounded-t transition-all duration-300"
                          style={{ height: '100%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {months[item.month - 1] || item.month}
                      </p>
                      <p className="text-xs font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        ₱{(item.total || 0)?.toLocaleString() || 0}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Membership by Gender */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Membership by Gender
              </h3>
              <div className="space-y-4">
                {membershipByGender && membershipByGender.length > 0 ? (
                  membershipByGender.map((item, index) => {
                    const total = membershipByGender.reduce((sum, item) => sum + (item.count || 0), 0);
                    const percentage = total > 0 ? Math.round(((item.count || 0) / total) * 100) : 0;
                    const color = item.gender === 'male' ? 'blue' : 'pink';
                    
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-4 h-4 bg-${color}-500 rounded-full mr-3`}></div>
                            <span className="text-sm font-medium text-gray-700 capitalize" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {item.gender}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {item.count || 0}
                            </span>
                            <span className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              ({percentage}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      No membership data available
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span>Total Members</span>
                    <span className="font-semibold">
                      {membershipByGender ? membershipByGender.reduce((sum, item) => sum + (item.count || 0), 0) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Expiring Memberships */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Expiring Memberships
              </h3>
              <div className="space-y-4">
                {expiringSoon > 0 ? (
                  <div className="text-center py-4">
                    <ExclamationTriangleIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {expiringSoon} memberships expiring soon
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Check the Members page for details
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      No memberships expiring soon
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Recent Announcements
                </h3>
                <div className="flex items-center space-x-2">
                  <MegaphoneIcon className="h-5 w-5 text-blue-500" />
                  <button
                    onClick={() => setShowAnnouncementModal(true)}
                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    New
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {recentAnnouncements?.length > 0 ? (
                  recentAnnouncements.slice(0, 5).map((announcement, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {announcement.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {announcement.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <span className="text-xs text-gray-500 capitalize" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {announcement.target_audience}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MegaphoneIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      No announcements yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Member Accounts</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalMemberAccounts || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Expired Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{expiredMembers || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Today's Attendance</p>
                  <p className="text-2xl font-semibold text-gray-900">--</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Create Announcement
              </h3>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAnnouncement}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={announcementForm.title}
                    onChange={handleAnnouncementInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={announcementForm.message}
                    onChange={handleAnnouncementInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter announcement message"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Target Audience *
                  </label>
                  <select
                    name="target_audience"
                    value={announcementForm.target_audience}
                    onChange={handleAnnouncementInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="all">All Users</option>
                    <option value="members">Members Only</option>
                    <option value="clerks">Clerks Only</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAnnouncement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingAnnouncement ? 'Creating...' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responsive Alert */}
      <ResponsiveAlert
        show={!!error || !!success}
        type={error ? 'error' : 'success'}
        message={error || success}
        onClose={() => {
          setError('');
          setSuccess('');
        }}
        fullScreen={false}
      />
    </div>
  );
} 