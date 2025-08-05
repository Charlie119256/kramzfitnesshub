'use client';

import React from 'react';

const EarningsChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Monthly Earnings
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p style={{ fontFamily: 'Poppins, sans-serif' }}>No earnings data available</p>
        </div>
      </div>
    );
  }

  const maxEarnings = Math.max(...data.map(item => item.earnings));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Monthly Earnings
      </h3>
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => {
          const height = maxEarnings > 0 ? (item.earnings / maxEarnings) * 100 : 0;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-gray-200 rounded-t" style={{ height: `${height}%` }}>
                <div 
                  className="bg-green-500 rounded-t transition-all duration-300"
                  style={{ height: '100%' }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {months[index] || item.month}
              </p>
              <p className="text-xs font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ₱{item.earnings?.toLocaleString() || 0}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EarningsChart; 