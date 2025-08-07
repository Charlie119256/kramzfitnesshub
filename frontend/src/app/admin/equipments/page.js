'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '../../../components/admin/AdminNavbar';
import { 
  CogIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import ResponsiveAlert from '@/components/common/ResponsiveAlert';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function EquipmentsPage() {
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showEditEquipmentModal, setShowEditEquipmentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Form states for equipment add/edit
  const [equipmentFormData, setEquipmentFormData] = useState({
    name: '',
    category_id: '',
    quantity: '',
    condition: '',
    price: '',
    purchase_date: '',
    status: 'available'
  });

  // Form states for category add/edit
  const [categoryFormData, setCategoryFormData] = useState({
    name: ''
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
      
      // Fetch equipment and categories in parallel
      const [equipmentResponse, categoriesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/equipment`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/equipment/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (equipmentResponse.ok && categoriesResponse.ok) {
        const equipmentData = await equipmentResponse.json();
        const categoriesData = await categoriesResponse.json();
        setEquipment(equipmentData);
        setCategories(categoriesData);
      } else {
        setError('Failed to fetch data');
      }
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Equipment CRUD functions
  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/equipment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipmentFormData)
      });

      if (response.ok) {
        setSuccess('Equipment added successfully!');
        setShowAddEquipmentModal(false);
        resetEquipmentForm();
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add equipment');
      }
    } catch (error) {
      setError('Failed to add equipment');
    }
  };

  const handleEditEquipment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/equipment/${selectedEquipment.equipment_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipmentFormData)
      });

      if (response.ok) {
        setSuccess('Equipment updated successfully!');
        setShowEditEquipmentModal(false);
        resetEquipmentForm();
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update equipment');
      }
    } catch (error) {
      setError('Failed to update equipment');
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/equipment/${equipmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Equipment deleted successfully!');
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete equipment');
      }
    } catch (error) {
      setError('Failed to delete equipment');
    }
  };

  // Category CRUD functions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/equipment/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryFormData)
      });

      if (response.ok) {
        setSuccess('Category added successfully!');
        setShowAddCategoryModal(false);
        resetCategoryForm();
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add category');
      }
    } catch (error) {
      setError('Failed to add category');
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/equipment/categories/${selectedCategory.category_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryFormData)
      });

      if (response.ok) {
        setSuccess('Category updated successfully!');
        setShowEditCategoryModal(false);
        resetCategoryForm();
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update category');
      }
    } catch (error) {
      setError('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all equipment in this category.')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/equipment/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Category deleted successfully!');
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete category');
      }
    } catch (error) {
      setError('Failed to delete category');
    }
  };

  const resetEquipmentForm = () => {
    setEquipmentFormData({
      name: '',
      category_id: '',
      quantity: '',
      condition: '',
      price: '',
      purchase_date: '',
      status: 'available'
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: ''
    });
  };

  const openEditEquipmentModal = (equipment) => {
    setSelectedEquipment(equipment);
    setEquipmentFormData({
      name: equipment.name || '',
      category_id: equipment.category_id || '',
      quantity: equipment.quantity || '',
      condition: equipment.condition || '',
      price: equipment.price || '',
      purchase_date: equipment.purchase_date || '',
      status: equipment.status || 'available'
    });
    setShowEditEquipmentModal(true);
  };

  const openEditCategoryModal = (category) => {
    setSelectedCategory(category);
    setCategoryFormData({
      name: category.name || ''
    });
    setShowEditCategoryModal(true);
  };

  const openDetailsModal = (equipment) => {
    setSelectedEquipment(equipment);
    setShowDetailsModal(true);
  };

  const openAddEquipmentModal = () => {
    resetEquipmentForm();
    setShowAddEquipmentModal(true);
  };

  const openAddCategoryModal = () => {
    resetCategoryForm();
    setShowAddCategoryModal(true);
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
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading Equipment..." />;
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
              <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
              <p className="text-gray-600 mt-1">Kramz Fitness Hub - Manage Gym Equipment</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={openAddCategoryModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Category
              </button>
              <button
                onClick={openAddEquipmentModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Equipment
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CogIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">{equipment.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {equipment.filter(e => e.status === 'available').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <WrenchScrewdriverIcon className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Under Maintenance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {equipment.filter(e => e.status === 'under_maintenance').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CogIcon className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Table */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Equipment List</h3>
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
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
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
                  {equipment.map((item) => (
                    <tr key={item.equipment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getCategoryName(item.category_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.condition || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₱{item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailsModal(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditEquipmentModal(item)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(item.equipment_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Categories</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.category_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {equipment.filter(e => e.category_id === category.category_id).length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditCategoryModal(category)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.category_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
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

      {/* Add Equipment Modal */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Equipment</h3>
              <button
                onClick={() => setShowAddEquipmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={equipmentFormData.name}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={equipmentFormData.category_id}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, category_id: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                <input
                  type="number"
                  required
                  value={equipmentFormData.quantity}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, quantity: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Condition</label>
                <input
                  type="text"
                  value={equipmentFormData.condition}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, condition: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={equipmentFormData.price}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, price: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Date *</label>
                <input
                  type="date"
                  required
                  value={equipmentFormData.purchase_date}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, purchase_date: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={equipmentFormData.status}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, status: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditEquipmentModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Equipment</h3>
              <button
                onClick={() => setShowEditEquipmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={equipmentFormData.name}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={equipmentFormData.category_id}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, category_id: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                <input
                  type="number"
                  required
                  value={equipmentFormData.quantity}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, quantity: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Condition</label>
                <input
                  type="text"
                  value={equipmentFormData.condition}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, condition: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={equipmentFormData.price}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, price: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Date *</label>
                <input
                  type="date"
                  required
                  value={equipmentFormData.purchase_date}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, purchase_date: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={equipmentFormData.status}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, status: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditEquipmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                >
                  Update Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Category</h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Category</h3>
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Details Modal */}
      {showDetailsModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Equipment Details</h3>
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
                <p className="text-sm text-gray-600">Name: {selectedEquipment.name}</p>
                <p className="text-sm text-gray-600">Category: {getCategoryName(selectedEquipment.category_id)}</p>
                <p className="text-sm text-gray-600">Quantity: {selectedEquipment.quantity}</p>
                <p className="text-sm text-gray-600">Condition: {selectedEquipment.condition || 'N/A'}</p>
                <p className="text-sm text-gray-600">Price: ₱{selectedEquipment.price}</p>
                <p className="text-sm text-gray-600">Purchase Date: {selectedEquipment.purchase_date}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Status</h4>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEquipment.status)}`}>
                  {getStatusIcon(selectedEquipment.status)}
                  <span className="ml-1">{selectedEquipment.status.replace('_', ' ')}</span>
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