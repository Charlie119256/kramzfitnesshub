'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import ResponsiveAlert from '../../components/common/ResponsiveAlert';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
    
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Test connection first
      try {
        const healthResponse = await fetch('http://localhost:5000/api/health');
        if (!healthResponse.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (healthError) {
        setMessage('Cannot connect to server. Please make sure the backend server is running on port 5000 and try again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset email sent! Please check your inbox and click the reset link.');
      } else {
        setMessage(data.message || 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage('Failed to send password reset email. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
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
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <EnvelopeIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Forgot Password?
            </h1>
            <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ResponsiveAlert
              type={message.includes('sent') || message.includes('success') ? 'success' : 'error'}
              message={message}
              onClose={() => setMessage('')}
            />

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your email address"
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
              />
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
              {loading ? 'Sending Email...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleBackToLogin}
              className="text-green-600 hover:text-green-800 font-medium flex items-center justify-center mx-auto"
              style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 