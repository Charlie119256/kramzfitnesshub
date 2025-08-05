'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MemberNavbar from '../../../components/member/MemberNavbar';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function MemberPlan() {
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userRole && userRole !== 'member') {
      router.push('/login');
      return;
    }

    fetchPlanData();
  }, [router]);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      
      // Static data for plan page
      const staticData = {
        currentPlan: {
          name: "Premium Monthly",
          description: "Full access to all facilities and equipment",
          price: 1500.00,
          duration: 30,
          startDate: "2024-01-15",
          endDate: "2024-02-14",
          status: "active",
          remainingDays: 12
        },
        availablePlans: [
          {
            id: 1,
            name: "Basic Monthly",
            description: "Access to basic equipment and facilities",
            price: 800.00,
            duration: 30,
            features: ["Gym access", "Basic equipment", "Locker room"]
          },
          {
            id: 2,
            name: "Premium Monthly",
            description: "Full access to all facilities and equipment",
            price: 1500.00,
            duration: 30,
            features: ["All equipment", "Personal trainer", "Group classes", "Locker room", "Sauna"]
          },
          {
            id: 3,
            name: "Premium Yearly",
            description: "Full access with 2 months free",
            price: 15000.00,
            duration: 365,
            features: ["All equipment", "Personal trainer", "Group classes", "Locker room", "Sauna", "2 months free"]
          }
        ],
        membershipHistory: [
          {
            id: 1,
            planName: "Basic Monthly",
            startDate: "2023-12-15",
            endDate: "2024-01-14",
            status: "expired",
            price: 800.00
          },
          {
            id: 2,
            planName: "Premium Monthly",
            startDate: "2024-01-15",
            endDate: "2024-02-14",
            status: "active",
            price: 1500.00
          }
        ]
      };

      setPlanData(staticData);
    } catch (error) {
      console.error('Error fetching plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan data...</p>
        </div>
      </div>
    );
  }

  if (!planData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavbar activeMenu="plan" />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              My Plan
            </h1>
            <p className="text-gray-600 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Manage your membership and view available plans
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Plan */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Current Plan
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {planData.currentPlan.name}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(planData.currentPlan.status)}`}>
                        {getStatusIcon(planData.currentPlan.status)}
                        <span className="ml-1 capitalize">{planData.currentPlan.status}</span>
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {planData.currentPlan.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          ₱{planData.currentPlan.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Price
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {planData.currentPlan.remainingDays}
                        </div>
                        <div className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Days Left
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {planData.currentPlan.duration}
                        </div>
                        <div className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Days Total
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {Math.round((planData.currentPlan.remainingDays / planData.currentPlan.duration) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Used
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Start Date
                        </label>
                        <p className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {new Date(planData.currentPlan.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          End Date
                        </label>
                        <p className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {new Date(planData.currentPlan.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span style={{ fontFamily: 'Poppins, sans-serif' }}>Renew Plan</span>
                    </button>
                    
                    <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      <span style={{ fontFamily: 'Poppins, sans-serif' }}>View Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Plans */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Available Plans
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {planData.availablePlans.map((plan) => (
                      <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {plan.name}
                          </h3>
                          <span className="text-lg font-bold text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            ₱{plan.price.toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {plan.description}
                        </p>
                        
                        <div className="mb-3">
                          <ul className="text-sm text-gray-600 space-y-1">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                          <span style={{ fontFamily: 'Poppins, sans-serif' }}>Select Plan</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Membership History */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Membership History
                </h2>
              </div>
              
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Plan Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          End Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {planData.membershipHistory.map((membership) => (
                        <tr key={membership.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {membership.planName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {new Date(membership.startDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {new Date(membership.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(membership.status)}`}>
                              {getStatusIcon(membership.status)}
                              <span className="ml-1 capitalize">{membership.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            ₱{membership.price.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 