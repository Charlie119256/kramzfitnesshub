'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Please try again.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/users/verify-email?token=${token}&email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          
          // Check if email was already verified
          if (data.alreadyVerified) {
            setMessage('Email is already verified. You can access your dashboard.');
          } else {
            setMessage('Email verified successfully! You can now access your dashboard.');
          }
          
          // Store the token and user information for automatic login
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userEmail', email);
          
          // No automatic redirect - user must click the button
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
          
          // If it's an expired token, redirect to expired page with email
          if (data.message && data.message.includes('expired')) {
            setTimeout(() => {
              router.push(`/verification-expired?email=${encodeURIComponent(email)}`);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setMessage('Verification failed. Please check your connection and try again.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center" style={{ backgroundColor: '#F4F4F4' }}>
          <div className="mb-6">
            {status === 'verifying' && (
              <>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Verifying Email...
                </h1>
                <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Email Verified!
                </h1>
                <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  {message}
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircleIcon className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Verification Failed
                </h1>
                <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  {message}
                </p>
              </>
            )}
          </div>

          {status === 'success' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  // Get the stored role from the verification response
                  const userRole = localStorage.getItem('userRole');
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
                }}
                className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200"
                style={{ 
                  backgroundColor: '#69945F',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px'
                }}
              >
                Continue to Kramz Fitness Hub
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <button
                onClick={() => router.push('/verification-required')}
                className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200"
                style={{ 
                  backgroundColor: '#69945F',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px'
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors duration-200 hover:bg-gray-50"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px'
                }}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 