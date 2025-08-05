'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export default function ClerkDashboard() {
  const [loading, setLoading] = useState(true);
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
    
    // Check if user has clerk role
    if (userRole !== 'clerk') {
      // Wrong role, redirect to appropriate dashboard
      switch (userRole) {
        case 'admin':
          router.push('/admin');
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
    
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [router]);

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Clerk Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clerk Dashboard</h1>
              <p className="text-gray-600 mt-1">Kramz Fitness Hub - Staff Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                Notifications
              </button>
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {/* <CogIcon className="h-6 w-6 text-gray-600" /> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <UserGroupIcon className="h-24 w-24 text-green-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Clerk Dashboard</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Welcome to the Clerk Dashboard! This dashboard will provide tools for member check-in/check-out, 
            equipment monitoring, attendance tracking, and member support features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              {/* <CalendarIcon className="h-8 w-8 text-blue-600 mb-4" /> */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Member Check-in/Check-out</h3>
              <p className="text-gray-600 text-sm">Manage member attendance and access</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              {/* <CogIcon className="h-8 w-8 text-green-600 mb-4" /> */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipment Monitoring</h3>
              <p className="text-gray-600 text-sm">Track equipment status and maintenance</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <UserGroupIcon className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Member Support</h3>
              <p className="text-gray-600 text-sm">Assist members with their needs</p>
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 