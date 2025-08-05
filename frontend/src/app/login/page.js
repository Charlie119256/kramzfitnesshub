'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const memberToken = localStorage.getItem('memberToken');
    const userRole = localStorage.getItem('userRole');
    
    if ((adminToken || memberToken) && userRole) {
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

      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token and user role from backend response
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userEmail', formData.email);
        
        // Store token based on user role
        if (data.user.role === 'member') {
          localStorage.setItem('memberToken', data.token);
        } else {
          localStorage.setItem('adminToken', data.token);
        }
        
        // If it's a member, store member data
        if (data.user.role === 'member' && data.user.memberInfo) {
          localStorage.setItem('userData', JSON.stringify({
            firstName: data.user.memberInfo.first_name,
            lastName: data.user.memberInfo.last_name,
            memberId: data.user.memberInfo.member_id,
            memberCode: data.user.memberInfo.member_code,
            fullName: data.user.memberInfo.full_name
          }));
        }
        
        // Redirect based on role from backend
        switch (data.user.role) {
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
            router.push('/member'); // Default to member dashboard
        }
      } else {
        // Handle specific error cases
        if (response.status === 403 && data.message.includes('verify')) {
          // Email not verified - redirect to verification page
          localStorage.setItem('userEmail', formData.email);
          router.push('/verification-required');
        } else {
          setError(data.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please make sure the backend server is running on port 5000 and try again.');
      } else {
        setError('Login failed. Please check your connection and try again.');
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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8" style={{ backgroundColor: '#F4F4F4' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Welcome Back!
            </h1>
            <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              Sign in to your account
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                Email Address:
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
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
                Password:
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-gray-600 hover:text-gray-800"
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#69945F',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              Need an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-green-600 hover:text-green-800 font-medium"
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 