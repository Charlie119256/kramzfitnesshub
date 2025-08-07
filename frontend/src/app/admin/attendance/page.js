'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '../../../components/admin/AdminNavbar';
import { 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import ResponsiveAlert from '@/components/common/ResponsiveAlert';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Filter states
  const [filters, setFilters] = useState({
    date: '',
    member_id: '',
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
    fetchAttendanceRecords();
  }, [router]);

  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.member_id) params.append('member_id', filters.member_id);
      if (filters.status) params.append('status', filters.status);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/attendance/all?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      } else {
        setError('Failed to fetch attendance records');
      }
    } catch (error) {
      setError('Failed to fetch attendance records');
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
    fetchAttendanceRecords();
  };

  const handleClearFilters = () => {
    setFilters({
      date: '',
      member_id: '',
      status: ''
    });
    setLoading(true);
    fetchAttendanceRecords();
  };

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'absent':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'late':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 'N/A';
    const duration = new Date(timeOut) - new Date(timeIn);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculate statistics
  const totalRecords = attendanceRecords.length;
  const todayRecords = attendanceRecords.filter(record => 
    record.date === new Date().toISOString().slice(0, 10)
  ).length;
  const presentRecords = attendanceRecords.filter(record => 
    record.status === 'present'
  ).length;
  const uniqueMembers = new Set(attendanceRecords.map(record => record.member_id)).size;

  // Show loading while checking authentication
  if (checkingAuth) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading Attendance Records..." />;
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
              <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
              <p className="text-gray-600 mt-1">Kramz Fitness Hub - View All Member Attendance</p>
            </div>
            <button
              onClick={fetchAttendanceRecords}
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
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Present Today</p>
                  <p className="text-2xl font-bold text-gray-900">{todayRecords}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Present</p>
                  <p className="text-2xl font-bold text-gray-900">{presentRecords}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unique Members</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueMembers}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Member ID</label>
                  <input
                    type="text"
                    placeholder="Enter member ID"
                    value={filters.member_id}
                    onChange={(e) => handleFilterChange('member_id', e.target.value)}
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
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
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

          {/* Attendance Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
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
                  {attendanceRecords.map((record) => (
                    <tr key={record.attendance_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.member?.user?.first_name} {record.member?.user?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">ID: {record.member_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.time_in)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.time_out)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateDuration(record.time_in, record.time_out)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          <span className="ml-1">{record.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDetailsModal(record)}
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

      {/* Attendance Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Attendance Details</h3>
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
                  Name: {selectedRecord.member?.user?.first_name} {selectedRecord.member?.user?.last_name}
                </p>
                <p className="text-sm text-gray-600">Member ID: {selectedRecord.member_id}</p>
                <p className="text-sm text-gray-600">Email: {selectedRecord.member?.user?.email}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Attendance Information</h4>
                <p className="text-sm text-gray-600">Date: {formatDate(selectedRecord.date)}</p>
                <p className="text-sm text-gray-600">Time In: {formatTime(selectedRecord.time_in)}</p>
                <p className="text-sm text-gray-600">Time Out: {formatTime(selectedRecord.time_out)}</p>
                <p className="text-sm text-gray-600">Duration: {calculateDuration(selectedRecord.time_in, selectedRecord.time_out)}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Status</h4>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRecord.status)}`}>
                  {getStatusIcon(selectedRecord.status)}
                  <span className="ml-1">{selectedRecord.status}</span>
                </span>
              </div>
              
              {selectedRecord.membership_type && (
                <div>
                  <h4 className="font-medium text-gray-900">Membership Plan</h4>
                  <p className="text-sm text-gray-600">Plan: {selectedRecord.membership_type.name}</p>
                  <p className="text-sm text-gray-600">Price: ₱{selectedRecord.membership_type.price}</p>
                </div>
              )}
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