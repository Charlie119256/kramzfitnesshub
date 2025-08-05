'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function VerificationExpired() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL parameters or localStorage
    const emailFromUrl = searchParams.get('email');
    const storedEmail = localStorage.getItem('userEmail');
    const emailToUse = emailFromUrl || storedEmail || '';
    setEmail(emailToUse);
  }, [searchParams]);

  const handleLogin = () => {
    // Clear stored data and redirect to login
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const handleTryAgain = () => {
    if (email) {
      // Store email for verification flow
      localStorage.setItem('userEmail', email);
      // Redirect to verification required page with email
      router.push(`/verification-required?email=${encodeURIComponent(email)}`);
    } else {
      // No email found, go to login
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center" style={{ backgroundColor: '#F4F4F4' }}>
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <EnvelopeIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Email Verification Expired
            </h1>
            <p className="text-gray-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              Email Verification link has expired. Please log in and resend the link.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleTryAgain}
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
              onClick={handleLogin}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors duration-200 hover:bg-gray-50"
              style={{ 
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px'
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 