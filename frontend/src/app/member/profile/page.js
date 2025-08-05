'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MemberNavbar from '../../../components/member/MemberNavbar';
import { 
  UserIcon,
  CameraIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  QrCodeIcon,
  LockClosedIcon,
  ChartBarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function MemberProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  const [bmiData, setBmiData] = useState({
    current: null,
    height: null,
    weight: null,
    history: []
  });

  const [bmiCalculator, setBmiCalculator] = useState({
    height: '',
    weight: '',
    calculatedBMI: null,
    status: '',
    showCalculator: false
  });

  useEffect(() => {
    fetchProfileData();
    fetchBmiHistory();
  }, []);

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
      
      console.log('Token found:', token ? 'Yes' : 'No');
      console.log('adminToken:', localStorage.getItem('adminToken'));
      console.log('memberToken:', localStorage.getItem('memberToken'));
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Making API request to detailed-profile...');
      
      // Fetch detailed member profile from API
      const response = await fetch('http://localhost:5000/api/member-dashboard/detailed-profile', {
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
        throw new Error(`Failed to fetch profile data: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Profile data received:', data);
      
      // Transform API data to match our component structure
      const profileData = {
        member_id: data.member_id,
        first_name: data.first_name,
        last_name: data.last_name,
        middle_name: data.middle_name,
        suffix: data.suffix,
        email: data.email,
        phone: data.contact_number,
        profile_picture: data.profile_picture,
        qr_code: data.qr_code_path || "/qr-code-example.png",
        created_at: data.created_at,
        // Additional fields from API
        dob: data.dob,
        gender: data.gender,
        barangay: data.barangay,
        municipality: data.municipality,
        city: data.city,
        age: calculateAge(data.dob)
      };
      
      setProfileData(profileData);
      setFormData({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBmiHistory = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
      console.log('BMI History - Token found:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('BMI History - No token, skipping');
        return;
      }

      console.log('BMI History - Making API request...');
      // Fetch BMI history from API
      const response = await fetch('http://localhost:5000/api/bmi', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('BMI History - Response status:', response.status);
      
      if (response.ok) {
        const bmiRecords = await response.json();
        console.log('BMI History - Records received:', bmiRecords);
        
        if (bmiRecords.length > 0) {
          // Get the latest record for current BMI
          const latestRecord = bmiRecords[0];
          
          // Transform records for display
          const history = bmiRecords.slice(0, 3).map(record => ({
            date: new Date(record.recorded_at).toISOString().split('T')[0],
            bmi: parseFloat(record.bmi_value),
            weight: record.weight_kg
          }));

          setBmiData(prev => ({
            ...prev,
            current: parseFloat(latestRecord.bmi_value),
            height: latestRecord.height_cm,
            weight: latestRecord.weight_kg,
            history: history
          }));
        }
      } else {
        const errorText = await response.text();
        console.log('BMI History - Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching BMI history:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(''); // Clear previous errors
      
      const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
      
      console.log('Upload - Token found:', token ? 'Yes' : 'No');
      console.log('Upload - Member ID:', profileData.member_id);
      console.log('Upload - Profile Data:', profileData);
      console.log('Upload - File:', selectedFile.name, selectedFile.size, selectedFile.type);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First, test the member ID with a simple GET request
      console.log('Upload - Testing member ID...');
      const testResponse = await fetch(`http://localhost:5000/api/members/test/${profileData.member_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Upload - Test response status:', testResponse.status);
      if (testResponse.ok) {
        const testResult = await testResponse.json();
        console.log('Upload - Test result:', testResult);
      }

      const formData = new FormData();
      formData.append('profile_picture', selectedFile);
      
      console.log('Upload - Making API request...');
      
      // Call profile picture upload API
      const response = await fetch(`http://localhost:5000/api/members/profile/${profileData.member_id}/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('Upload - Response status:', response.status);
      console.log('Upload - Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Upload - Error response:', errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload - Success result:', result);
      
      // Update profile data with the uploaded image path
      setProfileData(prev => ({
        ...prev,
        profile_picture: result.profile_picture
      }));
      
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Show success message
      alert('Profile picture uploaded successfully!');
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload profile picture: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call profile picture delete API
      const response = await fetch(`http://localhost:5000/api/members/profile/${profileData.member_id}/picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete profile picture');
      }
      
      setProfileData(prev => ({
        ...prev,
        profile_picture: null
      }));
      
    } catch (err) {
      setError('Failed to delete profile picture: ' + err.message);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call profile update API
      const response = await fetch(`http://localhost:5000/api/members/profile/${profileData.member_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      setProfileData(prev => ({
        ...prev,
        ...formData
      }));
      
      setIsEditing(false);
      
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      phone: profileData.phone
    });
    setIsEditing(false);
  };

  const handleDownloadQR = () => {
    // Download actual QR code if available
    if (profileData.qr_code && profileData.qr_code !== "/qr-code-example.png") {
      const link = document.createElement('a');
      link.href = `http://localhost:5000/${profileData.qr_code}`;
      link.download = `qr-code-${profileData.first_name}-${profileData.last_name}.png`;
      link.click();
    } else {
      alert('QR code not available for download');
    }
  };



  const handleChangePassword = () => {
    // Navigate to change password page or open modal
    alert('Change password functionality will be implemented here');
  };

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 100) / 100; // Round to 2 decimal places
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { status: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { status: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { status: 'Overweight', color: 'text-yellow-600' };
    return { status: 'Obese', color: 'text-red-600' };
  };

  const handleBMICalculation = () => {
    const bmi = calculateBMI(bmiCalculator.height, bmiCalculator.weight);
    if (bmi) {
      const status = getBMIStatus(bmi);
      setBmiCalculator(prev => ({
        ...prev,
        calculatedBMI: bmi,
        status: status.status
      }));
    }
  };

  const handleSaveBMI = async () => {
    if (!bmiCalculator.calculatedBMI) return;

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call BMI API
      const response = await fetch('http://localhost:5000/api/bmi', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          height_cm: bmiCalculator.height,
          weight_kg: bmiCalculator.weight,
          notes: `BMI calculated on ${new Date().toLocaleDateString()}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save BMI record');
      }

      const result = await response.json();

      // Update local state
      const newRecord = {
        date: new Date().toISOString().split('T')[0],
        bmi: bmiCalculator.calculatedBMI,
        weight: bmiCalculator.weight
      };

      setBmiData(prev => ({
        ...prev,
        current: bmiCalculator.calculatedBMI,
        height: bmiCalculator.height,
        weight: bmiCalculator.weight,
        history: [...prev.history, newRecord]
      }));

      // Reset calculator
      setBmiCalculator({
        height: '',
        weight: '',
        calculatedBMI: null,
        status: '',
        showCalculator: false
      });

      alert('BMI record saved successfully!');

    } catch (error) {
      alert('Failed to save BMI record: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProfileData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavbar memberName={`${profileData.first_name} ${profileData.last_name}`} activeMenu="profile" />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Container - Profile Picture and Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Profile Settings
                  </h1>
                  <p className="text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Manage your profile information and picture
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Side - Profile Picture and Name */}
                    <div className="space-y-6">
                      {/* Profile Picture Section */}
                      <div className="text-center">
                        <div className="relative inline-block">
                          {/* Profile Picture */}
                          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                            {profileData.profile_picture ? (
                              <img
                                src={profileData.profile_picture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-16 w-16 text-gray-400" />
                            )}
                          </div>

                          {/* Upload/Preview */}
                          {selectedFile && (
                            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Upload Button */}
                          <div className="space-y-2">
                            <label className="cursor-pointer block">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                              <div className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                <CameraIcon className="h-4 w-4 mr-2" />
                                <span style={{ fontFamily: 'Poppins, sans-serif' }}>Upload Photo</span>
                              </div>
                            </label>

                            {/* Upload/Delete Actions */}
                            {selectedFile && (
                              <>
                                <button
                                  onClick={handleUpload}
                                  disabled={uploading}
                                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                                >
                                  {uploading ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <CheckIcon className="h-4 w-4 mr-2" />
                                      <span style={{ fontFamily: 'Poppins, sans-serif' }}>Save Photo</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                  }}
                                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                                >
                                  <XMarkIcon className="h-4 w-4 mr-2" />
                                  <span style={{ fontFamily: 'Poppins, sans-serif' }}>Cancel</span>
                                </button>
                              </>
                            )}

                            {/* Delete Button */}
                            {profileData.profile_picture && !selectedFile && (
                              <button
                                onClick={handleDeletePicture}
                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                <span style={{ fontFamily: 'Poppins, sans-serif' }}>Remove Photo</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Full Name */}
                      <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {profileData.first_name} {profileData.middle_name ? `${profileData.middle_name} ` : ''}{profileData.last_name} {profileData.suffix || ''}
                        </h2>
                        <p className="text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Member
                        </p>
                      </div>
                    </div>

                    {/* Right Side - QR Code */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          QR Code
                        </h3>
                        <div className="relative inline-block">
                                                     {/* QR Code Display */}
                           <div className="w-32 h-32 bg-white p-4 rounded-lg border-2 border-gray-200 flex items-center justify-center mx-auto mb-4">
                             {profileData.qr_code && profileData.qr_code !== "/qr-code-example.png" ? (
                               <img
                                 src={`http://localhost:5000/${profileData.qr_code}`}
                                 alt="QR Code"
                                 className="w-full h-full object-contain"
                                 onError={(e) => {
                                   e.target.style.display = 'none';
                                   e.target.nextSibling.style.display = 'flex';
                                 }}
                               />
                             ) : null}
                             <div className={`w-full h-full bg-gray-100 flex items-center justify-center rounded ${profileData.qr_code && profileData.qr_code !== "/qr-code-example.png" ? 'hidden' : ''}`}>
                               <QrCodeIcon className="h-16 w-16 text-gray-400" />
                             </div>
                           </div>

                                                                                 {/* Download QR Button */}
                            <div className="space-y-2">
                              <button
                                onClick={handleDownloadQR}
                                disabled={!profileData.qr_code || profileData.qr_code === "/qr-code-example.png"}
                                className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                                  profileData.qr_code && profileData.qr_code !== "/qr-code-example.png"
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                }`}
                              >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {profileData.qr_code && profileData.qr_code !== "/qr-code-example.png" ? 'Download QR' : 'QR Not Available'}
                                </span>
                              </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Profile Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          />
                        ) : (
                          <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {profileData.first_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          />
                        ) : (
                          <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {profileData.last_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Middle Name
                        </label>
                        <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {profileData.middle_name || 'Not provided'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Suffix
                        </label>
                        <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {profileData.suffix || 'Not provided'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Birthdate
                        </label>
                        <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {formatDate(profileData.dob)}
                          {profileData.age && (
                            <span className="text-gray-500 ml-2">({profileData.age} years old)</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Gender
                        </label>
                        <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {profileData.gender || 'Not provided'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Email
                        </label>
                        <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {profileData.email}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Phone
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          />
                        ) : (
                          <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {profileData.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Address
                        </label>
                        <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {[profileData.barangay, profileData.municipality, profileData.city].filter(Boolean).join(', ') || 'Not provided'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Member Since
                        </label>
                        <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {new Date(profileData.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex space-x-4">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                          >
                            <CheckIcon className="h-4 w-4 mr-2" />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>Save</span>
                          </button>
                          <button
                            onClick={handleCancel}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                          >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>Cancel</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>Edit Profile</span>
                          </button>
                          <button
                            onClick={handleChangePassword}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                          >
                            <LockClosedIcon className="h-4 w-4 mr-2" />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>Change Password</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Container - BMI Tracker */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    BMI Tracker
                  </h2>
                </div>
                
                <div className="p-6">
                  {/* Current BMI */}
                  <div className="text-center mb-6">
                    {bmiData.current ? (
                      <>
                        <div className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {bmiData.current}
                        </div>
                        <div className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Current BMI
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          --
                        </div>
                        <div className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          No BMI data
                        </div>
                      </>
                    )}
                  </div>

                  {/* BMI Status */}
                  {bmiData.current && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Status
                        </span>
                        <span className={`text-sm font-medium ${getBMIStatus(bmiData.current).color}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {getBMIStatus(bmiData.current).status}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  )}

                  {/* Height and Weight */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {bmiData.height ? `${bmiData.height} cm` : '--'}
                      </div>
                      <div className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Height
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {bmiData.weight ? `${bmiData.weight} kg` : '--'}
                      </div>
                      <div className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Weight
                      </div>
                    </div>
                  </div>

                  {/* BMI Calculator */}
                  <div className="mb-6">
                    <button
                      onClick={() => setBmiCalculator(prev => ({ ...prev, showCalculator: !prev.showCalculator }))}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {bmiCalculator.showCalculator ? 'Hide Calculator' : 'BMI Calculator'}
                      </span>
                    </button>

                    {bmiCalculator.showCalculator && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Calculate New BMI
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Height (cm)
                            </label>
                            <input
                              type="number"
                              value={bmiCalculator.height}
                              onChange={(e) => setBmiCalculator(prev => ({ ...prev, height: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="175"
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Weight (kg)
                            </label>
                            <input
                              type="number"
                              value={bmiCalculator.weight}
                              onChange={(e) => setBmiCalculator(prev => ({ ...prev, weight: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="75"
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                          </div>

                          <button
                            onClick={handleBMICalculation}
                            className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>Calculate BMI</span>
                          </button>

                          {bmiCalculator.calculatedBMI && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {bmiCalculator.calculatedBMI}
                                </div>
                                <div className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  Calculated BMI
                                </div>
                                <div className={`text-sm font-medium mt-1 ${getBMIStatus(bmiCalculator.calculatedBMI).color}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {bmiCalculator.status}
                                </div>
                              </div>
                              
                              <button
                                onClick={handleSaveBMI}
                                className="w-full mt-3 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"
                              >
                                <CheckIcon className="h-3 w-3 mr-1" />
                                <span style={{ fontFamily: 'Poppins, sans-serif' }}>Save BMI Record</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BMI History */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Recent History
                    </h3>
                    <div className="space-y-2">
                      {bmiData.history.length > 0 ? (
                        bmiData.history.slice(-3).reverse().map((record, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {new Date(record.date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {record.weight} kg
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {record.bmi}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            No BMI history available
                          </p>
                          <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Use the calculator to add your first BMI record
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 