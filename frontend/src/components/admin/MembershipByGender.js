import React from 'react';

const MembershipByGender = ({ data = { male: 0, female: 0 } }) => {
  const total = data.male + data.female;
  const malePercentage = total > 0 ? Math.round((data.male / total) * 100) : 0;
  const femalePercentage = total > 0 ? Math.round((data.female / total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Membership by Gender
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Male
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {data.male}
            </span>
            <span className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ({malePercentage}%)
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${malePercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-pink-500 rounded-full mr-3"></div>
            <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Female
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {data.female}
            </span>
            <span className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ({femalePercentage}%)
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${femalePercentage}%` }}
          ></div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <span>Total Members</span>
            <span className="font-semibold">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipByGender; 