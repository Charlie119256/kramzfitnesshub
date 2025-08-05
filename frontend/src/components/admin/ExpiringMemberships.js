'use client';

import React from 'react';
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ExpiringMemberships = ({ data = [] }) => {
  const expiringSoon = data.filter(item => item.daysLeft <= 30 && item.daysLeft > 0);
  const expired = data.filter(item => item.daysLeft <= 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Expiring Memberships
      </h3>

      <div className="space-y-4">
        {/* Expiring Soon */}
        {expiringSoon.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <ClockIcon className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-orange-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Expiring Soon ({expiringSoon.length})
              </span>
            </div>
            <div className="space-y-2">
              {expiringSoon.slice(0, 5).map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {member.member_name}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {member.membership_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {member.daysLeft} days left
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Expires: {member.expiry_date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expired */}
        {expired.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm font-medium text-red-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Expired ({expired.length})
              </span>
            </div>
            <div className="space-y-2">
              {expired.slice(0, 5).map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {member.member_name}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {member.membership_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Expired
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Expired: {member.expiry_date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No expiring memberships */}
        {expiringSoon.length === 0 && expired.length === 0 && (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No memberships expiring soon
            </p>
          </div>
        )}

        {/* Show more link if there are more than 5 */}
        {(expiringSoon.length > 5 || expired.length > 5) && (
          <div className="text-center pt-4">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
              View All ({expiringSoon.length + expired.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiringMemberships; 