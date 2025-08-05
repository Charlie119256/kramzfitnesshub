import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'blue', change = null }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500 text-white';
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'purple':
        return 'bg-purple-500 text-white';
      case 'orange':
        return 'bg-orange-500 text-white';
      case 'red':
        return 'bg-red-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${getColorClasses()}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard; 