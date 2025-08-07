'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function VerifyEmailChange() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'login-required'
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [tokenStored, setTokenStored] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmailChange = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          setStatus('error');
          setMessage('Invalid verification link. Missing token or email.');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/users/verify-email-change?token=${token}&email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          setUser(data.user);
          
          // Store the new token
          if (data.token) {
            console.log('Debug - Storing token:', data.token);
            console.log('Debug - User data:', data.user);
            
            // Clear ALL existing tokens first to prevent conflicts
            localStorage.removeItem('adminToken');
            localStorage.removeItem('memberToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('profileData');
            
            // Store the new token
            localStorage.setItem('memberToken', data.token);
            localStorage.setItem('userRole', 'member');
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            // Verify token was stored successfully
            setTimeout(() => {
              const storedToken = localStorage.getItem('memberToken');
              const storedUserData = localStorage.getItem('userData');
              console.log('Debug - Stored token:', storedToken);
              console.log('Debug - Stored user data:', storedUserData);
              
              if (storedToken) {
                setTokenStored(true);
                console.log('Token stored successfully:', storedToken);
              } else {
                setTokenStored(false);
                console.log('Token storage failed');
              }
            }, 100);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Email change verification failed.');
        }
      } catch (error) {
        console.error('Error verifying email change:', error);
        setStatus('error');
        setMessage('Failed to verify email change. Please check your connection and try again.');
      }
    };

    verifyEmailChange();
  }, [searchParams]);

  const handleGoToDashboard = () => {
    // Check if token is available
    const token = localStorage.getItem('memberToken');
    if (token) {
      // Force a page reload to ensure fresh data
      window.location.href = '/member';
    } else {
      // Token not available, show login required message
      setStatus('login-required');
      setMessage('Please log in with your new email address to access your dashboard.');
    }
  };

  const handleGoToLogin = () => {
    // Clear any existing data and redirect to login
    localStorage.removeItem('adminToken');
    localStorage.removeItem('memberToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            className="h-12 w-auto"
            src="/logo.png"
            alt="Kramz Fitness Hub"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Change Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'verifying' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            )}
            
            {status === 'success' && (
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600" />
            )}
            
            {status === 'error' && (
              <XCircleIcon className="mx-auto h-12 w-12 text-red-600" />
            )}

            {status === 'login-required' && (
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-600" />
            )}

            <div className="mt-4">
              {status === 'verifying' && (
                <p className="text-gray-600">Verifying your email change...</p>
              )}
              
              {status === 'success' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Email Changed Successfully!
                  </h3>
                  <p className="text-gray-600 mb-4">{message}</p>
                  {user && (
                    <p className="text-sm text-gray-500 mb-4">
                      Your email has been updated to: <strong>{user.email}</strong>
                    </p>
                  )}
                  {!tokenStored && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> You may need to log in again in a different browser or tab.
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleGoToDashboard}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
              
              {status === 'login-required' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Login Required
                  </h3>
                  <p className="text-gray-600 mb-4">{message}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Please log in with your new email address: <strong>{user?.email}</strong>
                  </p>
                  <button
                    onClick={handleGoToLogin}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Login
                  </button>
                </div>
              )}
              
              {status === 'error' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-gray-600 mb-4">{message}</p>
                  <button
                    onClick={handleGoToLogin}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 