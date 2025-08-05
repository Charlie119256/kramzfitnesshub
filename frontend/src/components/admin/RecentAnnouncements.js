import React from 'react';
import { MegaphoneIcon, CalendarIcon } from '@heroicons/react/24/outline';

const RecentAnnouncements = ({ data = [] }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Recent Announcements
        </h3>
        <MegaphoneIcon className="h-5 w-5 text-blue-500" />
      </div>

      <div className="space-y-4">
        {data.length > 0 ? (
          data.slice(0, 5).map((announcement, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {announcement.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {announcement.content}
                  </p>
                  <div className="flex items-center text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(announcement.created_at)}
                  </div>
                </div>
                {announcement.is_important && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Important
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MegaphoneIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No announcements yet
            </p>
          </div>
        )}

        {data.length > 5 && (
          <div className="text-center pt-4 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
              View All Announcements ({data.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentAnnouncements; 