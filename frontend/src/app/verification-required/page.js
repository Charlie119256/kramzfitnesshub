'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function VerificationRequired() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Get email from localStorage or URL params
    const storedEmail = localStorage.getItem('userEmail');
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    const emailToUse = emailFromUrl || storedEmail || '';
    setEmail(emailToUse);
    
    // Show message that verification email was already sent
    if (emailToUse) {
      setMessage('A verification email has been sent to your inbox. Please check your email and click the verification link.');
    }
  }, []);

  const handleVerifyByEmail = async () => {
    if (!email) {
      setMessage('Email not found. Please go back to registration and try again.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/users/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox and click the verification link.');
      } else {
        setMessage(data.message || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      setMessage('Failed to send verification email. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const handleGoBack = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center" style={{ backgroundColor: '#F4F4F4' }}>
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <EnvelopeIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Verification Required
            </h1>
            <p className="text-gray-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              To keep your account secure, we need to confirm your identity. Please verify your account to continue using Kramz Fitness Hub.
            </p>
            <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
              Learn more
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              message.includes('sent') || message.includes('success') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`} style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleVerifyByEmail}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#69945F',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px'
              }}
            >
              {loading ? 'Sending Email...' : 'Resend Verification Email'}
            </button>

            {!email && (
              <button
                onClick={handleGoBack}
                className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors duration-200 hover:bg-gray-50"
                style={{ 
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px'
                }}
              >
                Go Back to Registration
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors duration-200 hover:bg-gray-50"
              style={{ 
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 