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
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
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
      
      // Static data for now
      const staticData = {
        totalEarnings: 125000,
        totalMembersWithMembership: 45,
        totalMemberAccounts: 52,
        totalStaff: 8,
        totalEquipment: 25,
        expiringSoon: 3,
        expiredMembers: 2,
        membershipByGender: {
          male: 28,
          female: 17
        },
        recentAnnouncements: [
          {
            id: 1,
            title: "New Equipment Arrival",
            content: "We've added new treadmills and weight machines to enhance your workout experience.",
            created_at: "2024-01-15T10:30:00Z",
            is_important: true
          },
          {
            id: 2,
            title: "Holiday Schedule Update",
            content: "The gym will have modified hours during the upcoming holidays. Check the schedule.",
            created_at: "2024-01-14T14:20:00Z",
            is_important: false
          },
          {
            id: 3,
            title: "Fitness Challenge Starting",
            content: "Join our 30-day fitness challenge starting next week. Great prizes await!",
            created_at: "2024-01-13T09:15:00Z",
            is_important: true
          }
        ],
        expiringMemberships: [
          {
            member_name: "John Smith",
            membership_name: "Premium Plan",
            daysLeft: 5,
            expiry_date: "2024-01-20"
          },
          {
            member_name: "Sarah Johnson",
            membership_name: "Basic Plan",
            daysLeft: 12,
            expiry_date: "2024-01-27"
          },
          {
            member_name: "Mike Davis",
            membership_name: "Premium Plan",
            daysLeft: 0,
            expiry_date: "2024-01-15"
          }
        ],
        monthlyEarnings: [
          { month: 1, earnings: 85000 },
          { month: 2, earnings: 92000 },
          { month: 3, earnings: 88000 },
          { month: 4, earnings: 95000 },
          { month: 5, earnings: 102000 },
          { month: 6, earnings: 98000 },
          { month: 7, earnings: 105000 },
          { month: 8, earnings: 112000 },
          { month: 9, earnings: 108000 },
          { month: 10, earnings: 115000 },
          { month: 11, earnings: 120000 },
          { month: 12, earnings: 125000 }
        ]
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData(staticData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
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
                  const maxEarnings = Math.max(...dashboardData.monthlyEarnings.map(item => item.earnings));
                  const height = maxEarnings > 0 ? (item.earnings / maxEarnings) * 100 : 0;
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
                        {months[index] || item.month}
                      </p>
                      <p className="text-xs font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        ₱{item.earnings?.toLocaleString() || 0}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Male
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {membershipByGender?.male || 0}
                    </span>
                    <span className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      ({membershipByGender ? Math.round((membershipByGender.male / (membershipByGender.male + membershipByGender.female)) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${membershipByGender ? (membershipByGender.male / (membershipByGender.male + membershipByGender.female)) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-pink-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Female
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {membershipByGender?.female || 0}
                    </span>
                    <span className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      ({membershipByGender ? Math.round((membershipByGender.female / (membershipByGender.male + membershipByGender.female)) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${membershipByGender ? (membershipByGender.female / (membershipByGender.male + membershipByGender.female)) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span>Total Members</span>
                    <span className="font-semibold">{membershipByGender ? membershipByGender.male + membershipByGender.female : 0}</span>
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
                {dashboardData.expiringMemberships?.length > 0 ? (
                  dashboardData.expiringMemberships.slice(0, 5).map((member, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      member.daysLeft <= 0 ? 'bg-red-50' : 'bg-orange-50'
                    }`}>
                      <div>
                        <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {member.member_name}
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {member.membership_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          member.daysLeft <= 0 ? 'text-red-600' : 'text-orange-600'
                        }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {member.daysLeft <= 0 ? 'Expired' : `${member.daysLeft} days left`}
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {member.daysLeft <= 0 ? 'Expired: ' : 'Expires: '}{member.expiry_date}
                        </p>
                      </div>
                    </div>
                  ))
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
                <MegaphoneIcon className="h-5 w-5 text-blue-500" />
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
                            {announcement.content}
                          </p>
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
                        </div>
                        {announcement.is_important && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Important
                          </span>
                        )}
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
    </div>
  );
} 