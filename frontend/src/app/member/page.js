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
import ResponsiveAlert from '../../components/common/ResponsiveAlert';

export default function MemberDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication first
    const adminToken = localStorage.getItem('adminToken');
    const memberToken = localStorage.getItem('memberToken');
    const userRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('userData');
    
    console.log('Debug - Auth check:', { 
      hasAdminToken: !!adminToken, 
      hasMemberToken: !!memberToken, 
      userRole, 
      userData: userData ? JSON.parse(userData) : null 
    });
    
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
    
    // Check if user is authenticated
    if ((!adminToken && !memberToken) || !userRole) {
      console.log('No token or role found, redirecting to login');
      router.push('/login');
      return;
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
      
      const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
      
      if (!token) {
        console.log('No authentication token found, redirecting to login');
        router.push('/login');
        return;
      }

             // Decode and verify the token before making the API call
       try {
         const base64Url = token.split('.')[1];
         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
         const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
           return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
         }).join(''));
         const decodedToken = JSON.parse(jsonPayload);
         
         console.log('Debug - Decoded token:', decodedToken);
         
         // Validate that the token has a user_id (basic validation)
         if (!decodedToken.user_id || typeof decodedToken.user_id !== 'number') {
           console.log('Debug - Token has invalid user_id:', decodedToken.user_id);
           console.log('Debug - Clearing tokens and redirecting to login');
           localStorage.removeItem('adminToken');
           localStorage.removeItem('memberToken');
           localStorage.removeItem('userRole');
           localStorage.removeItem('userData');
           localStorage.removeItem('userEmail');
           router.push('/login');
           return;
         }
       } catch (decodeError) {
         console.log('Debug - Failed to decode token:', decodeError);
         // If we can't decode the token, it's invalid
         localStorage.removeItem('adminToken');
         localStorage.removeItem('memberToken');
         localStorage.removeItem('userRole');
         localStorage.removeItem('userData');
         localStorage.removeItem('userEmail');
         router.push('/login');
         return;
       }

      console.log('Debug - Using token for API request:', token.substring(0, 20) + '...');
      console.log('Making API request to dashboard-data...');
      
      // Fetch real dashboard data from API
      const response = await fetch('http://localhost:5000/api/member-dashboard/dashboard-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        // If it's a 401 or 403 error, the token might be invalid
        if (response.status === 401 || response.status === 403) {
          console.log('Token appears to be invalid, redirecting to login');
          // Clear invalid tokens
          localStorage.removeItem('adminToken');
          localStorage.removeItem('memberToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userData');
          localStorage.removeItem('userEmail');
          router.push('/login');
          return;
        }
        
        // If it's a 404 error, it might be a member profile issue
        if (response.status === 404) {
          console.log('Member profile not found, checking if this is after email change');
          try {
            const errorData = JSON.parse(errorText);
            console.log('Error data:', errorData);
            
            // If this is after an email change, the user might need to log in again
            if (errorData.debug && errorData.debug.user_exists) {
              console.log('User exists but member profile not found - this might be after email change');
              // Clear tokens and redirect to login
              localStorage.removeItem('adminToken');
              localStorage.removeItem('memberToken');
              localStorage.removeItem('userRole');
              localStorage.removeItem('userData');
              localStorage.removeItem('userEmail');
              router.push('/login');
              return;
            }
          } catch (parseError) {
            console.log('Could not parse error response as JSON');
          }
        }
        
        throw new Error(`Failed to fetch dashboard data: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Dashboard data received:', data);
      
      // Transform API data to match our component structure
      const dashboardData = {
        memberName: data.memberInfo ? `${data.memberInfo.first_name} ${data.memberInfo.last_name}` : memberName,
        membershipPlan: data.hasActiveMembership ? data.membership?.membershipType?.name : "No Active Plan",
        membershipExpiry: data.hasActiveMembership ? data.membership?.end_date : null,
        daysUntilExpiry: data.remainingDays || 0,
        totalWorkouts: data.totalWorkoutDays || 0,
        thisMonthWorkouts: 0, // Not provided by API
        lastWorkout: data.recentAttendance?.[0]?.date || "No recent workouts",
        currentStreak: 0, // Would need separate API call
        longestStreak: 0, // Would need separate API call
        totalCaloriesBurned: 0, // Not provided by API
        thisMonthCalories: 0, // Not provided by API
        bmi: 0, // Not provided by API
        weight: 0, // Not provided by API
        targetWeight: 0, // Not provided by API
        recentAnnouncements: data.announcements || [],
        upcomingWorkouts: [], // Not provided by API
        monthlyProgress: [] // Not provided by API
      };
      
      setDashboardData(dashboardData);
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      setError(err.message);
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
      
      {/* Responsive Success and Error Messages */}
      <ResponsiveAlert
        type="success"
        message={success}
        onClose={() => setSuccess('')}
        fullScreen={success && success.includes('successfully')}
      />
      <ResponsiveAlert
        type="error"
        message={error}
        onClose={() => setError('')}
        fullScreen={error && (error.includes('Failed to fetch dashboard data') || error.includes('No authentication token found'))}
      />
      
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