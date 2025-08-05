'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('form'); // 'form', 'success', 'error'
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token and email from URL parameters
    const tokenFromUrl = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');
    
    if (!tokenFromUrl || !emailFromUrl) {
      setStatus('error');
      setMessage('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    setToken(tokenFromUrl);
    setEmail(emailFromUrl);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.password || !formData.confirmPassword) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          newPassword: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Password reset successfully! You can now log in with your new password.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Password reset failed. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setStatus('error');
      setMessage('Password reset failed. Please check your connection and try again.');
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

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleRequestNewReset = () => {
    router.push('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8" style={{ backgroundColor: '#F4F4F4' }}>
          {status === 'form' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Reset Password
                </h1>
                <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                      {message}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                    New Password
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
                      placeholder="Enter your new password"
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-12"
                      placeholder="Confirm your new password"
                      style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
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
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Password Reset Successfully!
              </h1>
              <p className="text-gray-600 mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                {message}
              </p>
              <button
                onClick={handleBackToLogin}
                className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200"
                style={{ 
                  backgroundColor: '#69945F',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px'
                }}
              >
                Continue to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Reset Failed
              </h1>
              <p className="text-gray-600 mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRequestNewReset}
                  className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#69945F',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px'
                  }}
                >
                  Request New Reset
                </button>
                <button
                  onClick={handleBackToLogin}
                  className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors duration-200 hover:bg-gray-50"
                  style={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px'
                  }}
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 