'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MemberNavbar from '../../components/member/MemberNavbar';
import { 
  ChartBarIcon, 
  UserIcon, 
  CalendarIcon,
  WrenchScrewdriverIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MegaphoneIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  FireIcon,
  HeartIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export default function MemberDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication first
    const adminToken = localStorage.getItem('adminToken');
    const memberToken = localStorage.getItem('memberToken');
    const userRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('userData');
    
    console.log('Auth check:', { adminToken, memberToken, userRole, userData });
    
    // Get member name from user data
    let memberName = "Member";
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        // Use full name if available
        memberName = parsedUserData.firstName && parsedUserData.lastName 
          ? `${parsedUserData.firstName} ${parsedUserData.lastName}`
          : parsedUserData.firstName || parsedUserData.name || parsedUserData.email || "Member";
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Temporary bypass for testing - remove this in production
    if ((!adminToken && !memberToken) || !userRole) {
      console.log('No token or role, but allowing access for testing');
      // Comment out the redirect for testing
      // router.push('/login');
      // return;
    }
    
    // Check if user has member role
    if (userRole && userRole !== 'member') {
      // Wrong role, redirect to appropriate dashboard
      console.log('Wrong role, redirecting to appropriate dashboard');
      switch (userRole) {
        case 'admin':
          router.push('/admin');
          break;
        case 'clerk':
          router.push('/clerk');
          break;
        default:
          router.push('/login');
      }
      return;
    }
    
    console.log('Authentication successful, loading dashboard');
    setCheckingAuth(false);
    
    // Fetch dashboard data with member name
    fetchDashboardData(memberName);
  }, [router]);

  const handleLogout = () => {
    // Clear stored data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('memberToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    
    // Redirect to login page
    router.push('/login');
  };

  const fetchDashboardData = async (memberName = "Member") => {
    try {
      setLoading(true);
      
      // Static data for now
      const staticData = {
        memberName: memberName,
        membershipPlan: "Premium Plan",
        membershipExpiry: "2024-12-31",
        daysUntilExpiry: 45,
        totalWorkouts: 28,
        thisMonthWorkouts: 8,
        lastWorkout: "2024-01-15",
        currentStreak: 5,
        longestStreak: 12,
        totalCaloriesBurned: 12500,
        thisMonthCalories: 3200,
        bmi: 24.5,
        weight: 75.2,
        targetWeight: 70.0,
        recentAnnouncements: [
          {
            id: 1,
            title: "New Equipment Available",
            content: "We've added new treadmills and weight machines. Check them out!",
            created_at: "2024-01-15T10:30:00Z",
            is_important: true
          },
          {
            id: 2,
            title: "Fitness Challenge Starting",
            content: "Join our 30-day fitness challenge starting next week. Great prizes await!",
            created_at: "2024-01-14T14:20:00Z",
            is_important: false
          },
          {
            id: 3,
            title: "Holiday Schedule Update",
            content: "The gym will have modified hours during the upcoming holidays.",
            created_at: "2024-01-13T09:15:00Z",
            is_important: false
          }
        ],
        upcomingWorkouts: [
          {
            id: 1,
            name: "Cardio Session",
            date: "2024-01-18",
            time: "09:00",
            duration: "45 min"
          },
          {
            id: 2,
            name: "Strength Training",
            date: "2024-01-20",
            time: "16:00",
            duration: "60 min"
          },
          {
            id: 3,
            name: "Yoga Class",
            date: "2024-01-22",
            time: "07:30",
            duration: "30 min"
          }
        ],
        monthlyProgress: [
          { week: 1, workouts: 3, calories: 800 },
          { week: 2, workouts: 4, calories: 950 },
          { week: 3, workouts: 2, calories: 600 },
          { week: 4, workouts: 5, calories: 1200 }
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
    memberName,
    membershipPlan,
    membershipExpiry,
    daysUntilExpiry,
    totalWorkouts,
    thisMonthWorkouts,
    lastWorkout,
    currentStreak,
    longestStreak,
    totalCaloriesBurned,
    thisMonthCalories,
    bmi,
    weight,
    targetWeight,
    recentAnnouncements,
    upcomingWorkouts,
    monthlyProgress
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavbar memberName={memberName} activeMenu="dashboard" />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Membership Plan
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {membershipPlan}
                  </p>
                  <p className="text-sm mt-1 text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {daysUntilExpiry} days left
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500 text-white">
                  <UserIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    This Month Workouts
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {thisMonthWorkouts}
                  </p>
                  <p className="text-sm mt-1 text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {currentStreak} day streak
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500 text-white">
                  <FireIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Calories Burned
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {thisMonthCalories?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm mt-1 text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    This month
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-500 text-white">
                  <HeartIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
            <div>
                  <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Current Weight
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {weight} kg
                  </p>
                  <p className="text-sm mt-1 text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Target: {targetWeight} kg
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500 text-white">
                  <TrophyIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Progress Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Monthly Progress
              </h3>
              <div className="flex items-end justify-between h-48 space-x-2">
                {monthlyProgress?.map((item, index) => {
                  const maxWorkouts = Math.max(...monthlyProgress.map(item => item.workouts));
                  const height = maxWorkouts > 0 ? (item.workouts / maxWorkouts) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full bg-gray-200 rounded-t" style={{ height: `${height}%` }}>
                        <div 
                          className="bg-blue-500 rounded-t transition-all duration-300"
                          style={{ height: '100%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Week {item.week}
                      </p>
                      <p className="text-xs font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {item.workouts} workouts
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fitness Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Fitness Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FireIcon className="h-5 w-5 text-orange-500 mr-3" />
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Current Streak
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {currentStreak} days
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <TrophyIcon className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Longest Streak
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {longestStreak} days
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <HeartIcon className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Total Calories
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {totalCaloriesBurned?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      BMI
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {bmi}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Workouts and Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Upcoming Workouts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Upcoming Workouts
              </h3>
              <div className="space-y-4">
                {upcomingWorkouts?.length > 0 ? (
                  upcomingWorkouts.slice(0, 5).map((workout, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {workout.name}
                        </p>
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {workout.date} at {workout.time} ({workout.duration})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-blue-600 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Scheduled
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      No upcoming workouts scheduled
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
                            <ClockIcon className="h-3 w-3 mr-1" />
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
                  <CalendarIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Last Workout</p>
                  <p className="text-2xl font-semibold text-gray-900">{lastWorkout || 'Never'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FireIcon className="h-8 w-8 text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Workouts</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalWorkouts || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Membership Expiry</p>
                  <p className="text-2xl font-semibold text-gray-900">{membershipExpiry || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 