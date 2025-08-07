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
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import ResponsiveAlert from '@/components/common/ResponsiveAlert';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function MembersPage() {
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [members, setMembers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCompensationModal, setShowCompensationModal] = useState(false);
  const [showBulkCompensationModal, setShowBulkCompensationModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    membership_type: ''
  });

  // Compensation form states
  const [compensationForm, setCompensationForm] = useState({
    compensation_days: '',
    reason: '',
    compensation_date: '',
    notes: ''
  });

  // Bulk compensation form states
  const [bulkCompensationForm, setBulkCompensationForm] = useState({
    compensation_days: '',
    reason: '',
    compensation_date: '',
    notes: ''
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
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.membership_type) params.append('membership_type', filters.membership_type);
      
      // Fetch members and statistics in parallel
      const [membersResponse, statisticsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/members-management?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/members-management/statistics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (membersResponse.ok && statisticsResponse.ok) {
        const membersData = await membersResponse.json();
        const statisticsData = await statisticsResponse.json();
        
        setMembers(membersData);
        setStatistics(statisticsData);
      } else {
        setError('Failed to fetch members data');
      }
    } catch (error) {
      setError('Failed to fetch members data');
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
      search: '',
      membership_type: ''
    });
    setLoading(true);
    fetchData();
  };

  const openDetailsModal = (member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  const openCompensationModal = (member) => {
    setSelectedMember(member);
    setShowCompensationModal(true);
  };

  const handleCompensationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/members-management/${selectedMember.member_membership_id}/compensation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(compensationForm)
      });

      if (response.ok) {
        setSuccess('Compensation added successfully!');
        setShowCompensationModal(false);
        setCompensationForm({
          compensation_days: '',
          reason: '',
          compensation_date: '',
          notes: ''
        });
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add compensation');
      }
    } catch (error) {
      setError('Failed to add compensation');
    }
  };

  const handleBulkCompensationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/members-management/bulk-compensation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...bulkCompensationForm,
          member_membership_ids: selectedMembers.map(member => member.member_membership_id)
        })
      });

      if (response.ok) {
        setSuccess(`Compensation added successfully for ${selectedMembers.length} members!`);
        setShowBulkCompensationModal(false);
        setSelectedMembers([]);
        setBulkCompensationForm({
          compensation_days: '',
          reason: '',
          compensation_date: '',
          notes: ''
        });
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add bulk compensation');
      }
    } catch (error) {
      setError('Failed to add bulk compensation');
    }
  };

  const handleMemberSelection = (member) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m.member_membership_id === member.member_membership_id);
      if (isSelected) {
        return prev.filter(m => m.member_membership_id !== member.member_membership_id);
      } else {
        return [...prev, member];
      }
    });
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

  const getStatusColor = (remainingDays) => {
    if (remainingDays <= 7) return 'text-red-600';
    if (remainingDays <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (remainingDays) => {
    if (remainingDays <= 7) return <ExclamationTriangleIcon className="h-4 w-4" />;
    if (remainingDays <= 30) return <ClockIcon className="h-4 w-4" />;
    return <CheckCircleIcon className="h-4 w-4" />;
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading Members Data..." />;
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
              <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
              <p className="text-gray-600 mt-1">Kramz Fitness Hub - Active Members with Compensation Management</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkCompensationModal(true)}
                disabled={selectedMembers.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Bulk Compensation ({selectedMembers.length})
              </button>
              <button
                onClick={fetchData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalActiveMembers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.expiringSoon}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CalendarDaysIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Compensations</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalCompensations}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Selected Members</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedMembers.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Members</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search by name or email..."
                      className="block w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
                  <select
                    value={filters.membership_type}
                    onChange={(e) => handleFilterChange('membership_type', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="1">Premium Monthly</option>
                    <option value="2">Basic Monthly</option>
                    <option value="3">Premium Yearly</option>
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

          {/* Members Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Active Members</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers(members);
                          } else {
                            setSelectedMembers([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membership Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compensation Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.member_membership_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedMembers.some(m => m.member_membership_id === member.member_membership_id)}
                          onChange={() => handleMemberSelection(member)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.member.first_name} {member.member.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.member.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.membershipType.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.remainingDays)}`}>
                          {getStatusIcon(member.remainingDays)}
                          <span className="ml-1">{member.remainingDays} days</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.totalCompensationDays} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(member.effectiveEndDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailsModal(member)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openCompensationModal(member)}
                            className="text-green-600 hover:text-green-900"
                            title="Add Compensation"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {showDetailsModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Member Details</h3>
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
                  Name: {selectedMember.member.first_name} {selectedMember.member.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {selectedMember.member.user.email}
                </p>
                <p className="text-sm text-gray-600">
                  Contact: {selectedMember.member.contact_number}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Membership Information</h4>
                <p className="text-sm text-gray-600">
                  Plan: {selectedMember.membershipType.name}
                </p>
                <p className="text-sm text-gray-600">
                  Price: {formatCurrency(selectedMember.membershipType.price)}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {selectedMember.membershipType.duration_days} days
                </p>
                <p className="text-sm text-gray-600">
                  Start Date: {formatDate(selectedMember.start_date)}
                </p>
                <p className="text-sm text-gray-600">
                  End Date: {formatDate(selectedMember.end_date)}
                </p>
                <p className="text-sm text-gray-600">
                  Remaining Days: {selectedMember.remainingDays} days
                </p>
                <p className="text-sm text-gray-600">
                  Compensation Days: {selectedMember.totalCompensationDays} days
                </p>
                <p className="text-sm text-gray-600">
                  Effective End Date: {formatDate(selectedMember.effectiveEndDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compensation Modal */}
      {showCompensationModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Compensation</h3>
              <button
                onClick={() => setShowCompensationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCompensationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member</label>
                <p className="text-sm text-gray-600">
                  {selectedMember.member.first_name} {selectedMember.member.last_name}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compensation Days</label>
                <input
                  type="number"
                  min="1"
                  value={compensationForm.compensation_days}
                  onChange={(e) => setCompensationForm(prev => ({ ...prev, compensation_days: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <input
                  type="text"
                  value={compensationForm.reason}
                  onChange={(e) => setCompensationForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Gym maintenance, Holiday closure"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compensation Date</label>
                <input
                  type="date"
                  value={compensationForm.compensation_date}
                  onChange={(e) => setCompensationForm(prev => ({ ...prev, compensation_date: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={compensationForm.notes}
                  onChange={(e) => setCompensationForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCompensationModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Add Compensation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Compensation Modal */}
      {showBulkCompensationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Bulk Compensation</h3>
              <button
                onClick={() => setShowBulkCompensationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleBulkCompensationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Members</label>
                <p className="text-sm text-gray-600">
                  {selectedMembers.length} members selected
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compensation Days</label>
                <input
                  type="number"
                  min="1"
                  value={bulkCompensationForm.compensation_days}
                  onChange={(e) => setBulkCompensationForm(prev => ({ ...prev, compensation_days: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <input
                  type="text"
                  value={bulkCompensationForm.reason}
                  onChange={(e) => setBulkCompensationForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Gym maintenance, Holiday closure"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compensation Date</label>
                <input
                  type="date"
                  value={bulkCompensationForm.compensation_date}
                  onChange={(e) => setBulkCompensationForm(prev => ({ ...prev, compensation_date: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={bulkCompensationForm.notes}
                  onChange={(e) => setBulkCompensationForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBulkCompensationModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Add Bulk Compensation
                </button>
              </div>
            </form>
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