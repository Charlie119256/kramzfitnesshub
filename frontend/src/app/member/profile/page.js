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
import ResponsiveAlert from '../../../components/common/ResponsiveAlert';

export default function MemberProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    phone: '',
    email: '',
    barangay: '',
    municipality: '',
    city: ''
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
      console.log('Full token:', token);
      
      if (!token) {
        // No token found, redirect to login
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
        
        // If it's a 404 error, it might be a member profile issue after email change
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
        
        throw new Error(`Failed to fetch profile data: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Profile data received:', data);
      console.log('Profile picture from API:', data.profile_picture);
      
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
        middle_name: profileData.middle_name || '',
        suffix: profileData.suffix || '',
        phone: profileData.phone,
        email: profileData.email,
        barangay: profileData.barangay || '',
        municipality: profileData.municipality || '',
        city: profileData.city || ''
      });
      
    } catch (err) {
      console.error('Error in fetchProfileData:', err);
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
             weight: record.weight_kg,
             height: record.height_cm
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
      // Facebook-style: directly show preview without confirmation
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
      console.log('Upload - Profile picture path:', result.profile_picture);
      
      // Update profile data with the uploaded image path
      setProfileData(prev => ({
        ...prev,
        profile_picture: result.profile_picture
      }));
      
      setSelectedFile(null);
      setPreviewUrl(null);
      
                    // Show success message based on whether it's a new upload or replacement
        const message = profileData.profile_picture 
          ? 'Profile picture updated successfully! Previous photo has been removed.' 
          : 'Profile picture uploaded successfully!';
        
        // Use sweet alert for success message
        setSuccess(message);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload profile picture: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    // Facebook-style: ask for confirmation before deleting
    const confirmed = window.confirm(
      'Remove profile picture?'
    );
    
    if (!confirmed) {
      return;
    }

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
      
             // Use sweet alert for success message
       setSuccess('Profile picture removed successfully!');
      
    } catch (err) {
      setError('Failed to delete profile picture: ' + err.message);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Decode and verify the token before making the API call
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedToken = JSON.parse(jsonPayload);
        
        console.log('Debug - Decoded token in handleSave:', decodedToken);
        
        // Validate that the token has a user_id (basic validation)
        if (!decodedToken.user_id || typeof decodedToken.user_id !== 'number') {
          console.log('Debug - Token has invalid user_id in handleSave:', decodedToken.user_id);
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
        console.log('Debug - Failed to decode token in handleSave:', decodeError);
        // If we can't decode the token, it's invalid
        localStorage.removeItem('adminToken');
        localStorage.removeItem('memberToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        localStorage.removeItem('userEmail');
        router.push('/login');
        return;
      }

      // Prepare request body - only include email if it has changed
      const requestBody = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name,
        suffix: formData.suffix,
        contact_number: formData.phone,
        barangay: formData.barangay,
        municipality: formData.municipality,
        city: formData.city
      };

      // Only include email if it has actually changed
      if (formData.email !== profileData.email) {
        requestBody.email = formData.email;
      }

      // Call profile update API
      const response = await fetch(`http://localhost:5000/api/members/profile/${profileData.member_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      console.log('Backend response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      // Check if email verification is required
      console.log('Checking message:', data.message);
      console.log('Includes verification text:', data.message && data.message.includes('verification email has been sent'));
      if (data.message && data.message.includes('verification email has been sent')) {
        setSuccess('Profile updated successfully! A verification email has been sent to your new email address. Please check your inbox and click the verification link to complete the email change.');
        // Exit editing mode but keep the form data updated
        setFormData(prev => ({
          ...prev,
          email: formData.email // Update the email in form data
        }));
        setIsEditing(false);
      } else {
        setProfileData(prev => ({
          ...prev,
          ...formData
        }));
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
      }
      
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      middle_name: profileData.middle_name || '',
      suffix: profileData.suffix || '',
      phone: profileData.phone,
      email: profileData.email,
      barangay: profileData.barangay || '',
      municipality: profileData.municipality || '',
      city: profileData.city || ''
    });
    setIsEditing(false);
  };

  const handleDownloadQR = async () => {
         try {
       // Check if QR code is available
       if (!profileData.qr_code || profileData.qr_code === "/qr-code-example.png") {
         setError('QR code not available for download');
         return;
       }

      const token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Construct the full URL for the QR code
      const qrCodeUrl = profileData.qr_code.startsWith('http') 
        ? profileData.qr_code 
        : `http://localhost:5000/${profileData.qr_code}`;

      console.log('Downloading QR code from:', qrCodeUrl);

      // Fetch the QR code image as a blob
      const response = await fetch(qrCodeUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch QR code: ${response.status}`);
      }

      // Convert response to blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${profileData.first_name}-${profileData.last_name}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
             console.log('QR code downloaded successfully');
       setSuccess('QR code downloaded successfully!');
       
     } catch (error) {
       console.error('Error downloading QR code:', error);
       setError(`Failed to download QR code: ${error.message}`);
     }
  };



     const handleChangePassword = () => {
     // Navigate to change password page or open modal
     setError('Change password functionality will be implemented here');
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
         weight: bmiCalculator.weight,
         height: bmiCalculator.height
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

             setSuccess('BMI record saved successfully!');
 
     } catch (error) {
       setError('Failed to save BMI record: ' + error.message);
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
                                     {/* Responsive Success and Error Messages */}
                   <ResponsiveAlert
                     type="success"
                     message={success}
                     onClose={() => setSuccess('')}
                     fullScreen={success && (
                       success.includes('verification email has been sent') ||
                       success.includes('Profile picture') ||
                       success.includes('QR code downloaded') ||
                       success.includes('BMI record saved') ||
                       success.includes('Profile updated successfully')
                     )}
                   />
                   <ResponsiveAlert
                     type="error"
                     message={error}
                     onClose={() => setError('')}
                     fullScreen={error && (
                       error.includes('Failed to fetch profile data') ||
                       error.includes('No authentication token found') ||
                       error.includes('QR code not available') ||
                       error.includes('Failed to download QR code') ||
                       error.includes('Failed to save BMI record') ||
                       error.includes('Change password functionality') ||
                       error.includes('Failed to update profile')
                     )}
                   />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Side - Profile Picture and Name */}
                    <div className="space-y-6">
                                             {/* Profile Picture Section - Facebook Style */}
                       <div className="text-center">
                         <div className="relative inline-block group">
                                                       {/* Profile Picture Container */}
                            <div className="relative w-32 h-32 mx-auto mb-4">
                              {/* Profile Picture or Preview */}
                              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                {selectedFile ? (
                                  // Show preview when file is selected
                                  <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.log('Preview image failed to load');
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : profileData.profile_picture ? (
                                  // Show current profile picture
                                  <img
                                    src={(() => {
                                      const imageUrl = profileData.profile_picture.startsWith('http') 
                                        ? profileData.profile_picture 
                                        : `http://localhost:5000/${profileData.profile_picture}`;
                                      console.log('Profile picture URL:', imageUrl);
                                      return imageUrl;
                                    })()}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.log('Image failed to load:', profileData.profile_picture);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <UserIcon className="h-16 w-16 text-gray-400" />
                                )}
                              </div>

                              {/* Preview Badge - Only show when file is selected */}
                              {selectedFile && (
                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                  Preview
                                </div>
                              )}

                              {/* Facebook-style Camera Icon Overlay - Hide during preview */}
                              {!selectedFile && (
                                <div className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:bg-blue-700 transition-colors duration-200">
                                  <CameraIcon className="h-5 w-5 text-white" />
                                </div>
                              )}

                              {/* Hover Overlay for Change Photo - Hide during preview */}
                              {!selectedFile && (
                                <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                                  <div className="text-center text-white">
                                    <CameraIcon className="h-8 w-8 mx-auto mb-1" />
                                    <span className="text-xs font-medium">Change Photo</span>
                                  </div>
                                </div>
                              )}

                              {/* Hidden File Input */}
                              <label className="absolute inset-0 cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Action Buttons - Only show when file is selected */}
                            {selectedFile && (
                              <div className="space-y-2 mt-3">
                                <button
                                  onClick={handleUpload}
                                  disabled={uploading}
                                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 text-sm font-medium shadow-sm"
                                >
                                  {uploading ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      {profileData.profile_picture ? 'Updating...' : 'Uploading...'}
                                    </>
                                  ) : (
                                    <>
                                      <CheckIcon className="h-4 w-4 mr-2" />
                                      {profileData.profile_picture ? 'Replace Photo' : 'Save Photo'}
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                  }}
                                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium border border-gray-300"
                                >
                                  <XMarkIcon className="h-4 w-4 mr-2" />
                                  Cancel
                                </button>
                              </div>
                            )}

                          {/* Remove Photo Button (Facebook Style) */}
                          {profileData.profile_picture && !selectedFile && (
                            <div className="mt-3">
                              <button
                                onClick={handleDeletePicture}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Remove Photo
                              </button>
                            </div>
                          )}

                          {/* Help Text */}
                          {!selectedFile && !profileData.profile_picture && (
                            <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Add a profile photo to personalize your account
                            </p>
                          )}
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
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.middle_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, middle_name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                            placeholder="Enter middle name"
                          />
                        ) : (
                          <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {profileData.middle_name || 'Not provided'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Suffix
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.suffix}
                            onChange={(e) => setFormData(prev => ({ ...prev, suffix: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                            placeholder="Jr., Sr., III, etc."
                          />
                        ) : (
                          <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {profileData.suffix || 'Not provided'}
                          </p>
                        )}
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
                         {isEditing ? (
                           <input
                             type="email"
                             value={formData.email}
                             onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                             style={{ fontFamily: 'Poppins, sans-serif' }}
                             placeholder="Enter email address"
                           />
                         ) : (
                           <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                             {profileData.email}
                           </p>
                         )}
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
                          Barangay
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.barangay}
                            onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                            placeholder="Enter barangay"
                          />
                        ) : (
                          <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {profileData.barangay || 'Not provided'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Municipality
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.municipality}
                            onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                            placeholder="Enter municipality"
                          />
                        ) : (
                          <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {profileData.municipality || 'Not provided'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          City
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                            placeholder="Enter city"
                          />
                        ) : (
                          <p className="text-gray-900 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {profileData.city || 'Not provided'}
                          </p>
                        )}
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
                                 {record.height} cm • {record.weight} kg
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