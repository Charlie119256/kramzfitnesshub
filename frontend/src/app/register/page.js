'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Register() {
  const [formData, setFormData] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    suffix: '',
    gender: '',
    dateOfBirth: '',
    contactNumber: '',
    barangay: '',
    municipality: '',
    city: '',
    email: '',
    password: '',
    role: 'member' // Default role for new registrations
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      // User is already logged in, redirect to appropriate dashboard
      switch (userRole) {
        case 'admin':
          router.push('/admin');
          break;
        case 'clerk':
          router.push('/clerk');
          break;
        case 'member':
          router.push('/member');
          break;
        default:
          router.push('/member');
      }
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = {
      firstname: 'First Name',
      lastname: 'Last Name',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
      contactNumber: 'Contact Number',
      barangay: 'Barangay',
      municipality: 'Municipality',
      city: 'City',
      email: 'Email Address',
      password: 'Password'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === '') {
        setError(`${label} is required.`);
        return;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Validate contact number (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      setError('Please enter a valid contact number.');
      return;
    }

    // Validate date format
    if (!formData.dateOfBirth) {
      setError('Please select your date of birth.');
      return;
    }

    // Ensure date is in YYYY-MM-DD format for backend
    const dateObj = new Date(formData.dateOfBirth);
    if (isNaN(dateObj.getTime())) {
      setError('Please enter a valid date of birth.');
      return;
    }

    // Check if user is at least 13 years old
    const today = new Date();
    let age = today.getFullYear() - dateObj.getFullYear();
    const monthDiff = today.getMonth() - dateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
      age--;
    }
    if (age < 13) {
      setError('You must be at least 13 years old to register.');
      return;
    }
    
    if (!agreeToTerms) {
      setError('Please agree to the Terms and Conditions and Privacy Policy.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Test connection first
      try {
        const healthResponse = await fetch('http://localhost:5000/api/health');
        if (!healthResponse.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (healthError) {
        setError('Cannot connect to server. Please make sure the backend server is running on port 5000 and try again.');
        return;
      }

      // Prepare the request data
      const requestData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstname,
        middle_name: formData.middlename,
        last_name: formData.lastname,
        suffix: formData.suffix,
        gender: formData.gender,
        dob: formData.dateOfBirth,
        contact_number: formData.contactNumber,
        barangay: formData.barangay,
        municipality: formData.municipality,
        city: formData.city
      };

      console.log('Sending registration data:', requestData);

      // Call the real backend registration API
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok) {
        // Store email for verification flow
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userRole', formData.role);
        
        // Redirect to verification required page
        router.push('/verification-required');
      } else {
        // Show specific error messages based on status code
        if (response.status === 409) {
          setError('This email is already registered. Please use a different email or try logging in.');
        } else if (response.status === 400) {
          setError(data.message || 'Please check your information and try again.');
        } else if (response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please make sure the backend server is running on port 5000 and try again.');
      } else {
        setError('Registration failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenderChange = (e) => {
    setFormData({
      ...formData,
      gender: e.target.value
    });
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-white" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{ backgroundColor: '#212121' }}>
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl p-8" style={{ backgroundColor: '#F4F4F4' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Register
            </h1>
            <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              Create your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  {error}
                </p>
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Firstname
                </label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  required
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your firstname"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                />
              </div>

              <div>
                <label htmlFor="middlename" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Middlename
                </label>
                <input
                  id="middlename"
                  name="middlename"
                  type="text"
                  value={formData.middlename}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your middlename"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                />
              </div>

              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Lastname
                </label>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  required
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your lastname"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                />
              </div>

              <div>
                <label htmlFor="suffix" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Suffix
                </label>
                <input
                  id="suffix"
                  name="suffix"
                  type="text"
                  value={formData.suffix}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Jr., Sr., III"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                Gender
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleGenderChange}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    required
                  />
                  <span className="ml-2 text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                    Male
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleGenderChange}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    required
                  />
                  <span className="ml-2 text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                    Female
                  </span>
                </label>
              </div>
            </div>

            {/* Date of Birth and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                />
              </div>

              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Contact Number
                </label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your contact number"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Barangay
                </label>
                <input
                  id="barangay"
                  name="barangay"
                  type="text"
                  required
                  value={formData.barangay}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your barangay"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                />
              </div>

              <div>
                <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Municipality
                </label>
                <input
                  id="municipality"
                  name="municipality"
                  type="text"
                  required
                  value={formData.municipality}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your municipality"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your city"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Email and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your email address"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-12"
                    placeholder="Enter your password"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                required
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                By registering, you agree to Kramz Fitness Hub's{' '}
                <button type="button" className="text-green-600 hover:text-green-800 font-medium">
                  Terms and Condition
                </button>
                {' '}and{' '}
                <button type="button" className="text-green-600 hover:text-green-800 font-medium">
                  Privacy Policy
                </button>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeToTerms}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#69945F',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px'
              }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-green-600 hover:text-green-800 font-medium"
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 