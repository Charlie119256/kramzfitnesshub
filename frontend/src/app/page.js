'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  UserGroupIcon, 
  CogIcon, 
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [selectedRole, setSelectedRole] = useState(null);

  const dashboards = [
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Complete system management and analytics',
      icon: CogIcon,
      color: 'bg-blue-600',
      href: '/admin',
      features: [
        'Total earnings and financial reports',
        'Member and staff management',
        'Equipment inventory tracking',
        'System-wide announcements'
      ]
    },
    {
      id: 'clerk',
      title: 'Clerk Dashboard',
      description: 'Staff management and member assistance',
      icon: UserGroupIcon,
      color: 'bg-green-600',
      href: '/clerk',
      features: [
        'Member check-in/check-out',
        'Equipment status monitoring',
        'Attendance tracking',
        'Member support tools'
      ]
    },
    {
      id: 'member',
      title: 'Member Dashboard',
      description: 'Personal fitness tracking and membership',
      icon: UserIcon,
      color: 'bg-purple-600',
      href: '/member',
      features: [
        'Membership plan details',
        'Workout attendance history',
        'Personal fitness statistics',
        'Gym announcements'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kramz Fitness Hub</h1>
              <p className="text-gray-600 mt-1">Choose your dashboard</p>
            </div>
            <div className="text-sm text-gray-500">
              Version 1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Kramz Fitness Hub
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select your role to access the appropriate dashboard with tailored features and analytics.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${dashboard.color}`}>
                    <dashboard.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {dashboard.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dashboard.description}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {dashboard.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {feature}
          </li>
                  ))}
                </ul>

                <Link
                  href={dashboard.href}
                  className={`inline-flex items-center justify-center w-full px-4 py-3 rounded-lg text-white font-medium ${dashboard.color} hover:opacity-90 transition-opacity duration-200`}
                >
                  Access Dashboard
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access */}
        <div className="mt-16 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <CogIcon className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">Admin Dashboard</span>
            </Link>
            <Link
              href="/clerk"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <UserGroupIcon className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">Clerk Dashboard</span>
            </Link>
            <Link
              href="/member"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <UserIcon className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium text-gray-900">Member Dashboard</span>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">Backend API</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">Database</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">Frontend</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">Authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
