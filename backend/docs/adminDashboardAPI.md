# Admin Dashboard API Documentation

## Overview

The Admin Dashboard API provides dynamic data for the admin dashboard, including real-time statistics, analytics, and announcement management. The dashboard is no longer static and fetches live data from the database.

## Features

### Dynamic Data
- **Real-time Statistics**: Total earnings, active members, staff count, equipment count
- **Analytics**: Monthly earnings chart, membership by gender distribution
- **Alerts**: Expiring memberships, expired members count
- **Announcements**: Recent announcements with creation functionality

### Announcement System
- **Create Announcements**: Admin can create announcements for different target audiences
- **Target Audiences**: All users, members only, clerks only
- **Email Notifications**: Automatic email sending to target audience
- **Real-time Updates**: Dashboard refreshes after creating announcements

## API Endpoints

### 1. Get Dashboard Data
**GET** `/api/admin-dashboard/dashboard-data`

Returns comprehensive dashboard data including all statistics and analytics.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Response:**
```json
{
  "totalEarnings": 125000,
  "totalMembersWithMembership": 45,
  "totalMemberAccounts": 52,
  "totalStaff": 8,
  "totalEquipment": 25,
  "expiringSoon": 3,
  "expiredMembers": 2,
  "membershipByGender": [
    {
      "gender": "male",
      "count": 28
    },
    {
      "gender": "female", 
      "count": 17
    }
  ],
  "recentAnnouncements": [
    {
      "announcement_id": 1,
      "title": "New Equipment Arrival",
      "message": "We've added new treadmills and weight machines...",
      "target_audience": "all",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "monthlyEarnings": [
    {
      "month": 1,
      "total": 85000
    }
  ]
}
```

### 2. Create Announcement
**POST** `/api/announcements`

Creates a new announcement and sends emails to target audience.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Equipment Arrival",
  "message": "We've added new treadmills and weight machines to enhance your workout experience.",
  "target_audience": "all"
}
```

**Response:**
```json
{
  "message": "Announcement created and emails sent.",
  "announcement": {
    "announcement_id": 1,
    "title": "New Equipment Arrival",
    "message": "We've added new treadmills...",
    "target_audience": "all",
    "created_by": 1,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## Database Schema

### Announcements Table
```sql
CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_audience ENUM('all', 'members', 'clerks') NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

## Frontend Integration

### Dashboard Component
The admin dashboard (`frontend/src/app/admin/page.js`) has been updated to:

1. **Fetch Real Data**: Uses API calls instead of static data
2. **Dynamic Charts**: Monthly earnings and gender distribution charts
3. **Announcement Modal**: Create new announcements with form validation
4. **Responsive Alerts**: Success/error messages using ResponsiveAlert component
5. **Loading States**: Proper loading indicators during data fetching

### Key Features
- **Authentication Check**: Verifies admin role before loading data
- **Error Handling**: Comprehensive error handling with retry functionality
- **Real-time Updates**: Dashboard refreshes after creating announcements
- **Form Validation**: Client-side validation for announcement creation
- **Responsive Design**: Mobile-friendly interface

## Authentication

All dashboard endpoints require admin authentication:
- Valid JWT token in Authorization header
- User must have 'admin' role
- Token must not be expired

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token."
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required."
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to fetch dashboard data.",
  "error": "Database connection error"
}
```

## Usage Examples

### Frontend Dashboard Data Fetching
```javascript
const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('/api/admin-dashboard/dashboard-data', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const data = await response.json();
    setDashboardData(data);
  } catch (error) {
    setError(error.message);
  }
};
```

### Creating Announcements
```javascript
const handleCreateAnnouncement = async (formData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Failed to create announcement');
    }

    const result = await response.json();
    setSuccess('Announcement created successfully!');
    
    // Refresh dashboard data
    await fetchDashboardData();
  } catch (error) {
    setError(error.message);
  }
};
```

## Performance Considerations

1. **Parallel Data Fetching**: Dashboard uses Promise.all for concurrent API calls
2. **Caching**: Consider implementing Redis for frequently accessed data
3. **Pagination**: For large datasets, implement pagination
4. **Real-time Updates**: Consider WebSocket integration for live updates

## Security Features

1. **Role-based Access**: Only admin users can access dashboard data
2. **Token Validation**: JWT tokens are validated on every request
3. **Input Validation**: Server-side validation for announcement creation
4. **SQL Injection Protection**: Using Sequelize ORM with parameterized queries

## Monitoring and Logging

1. **API Logging**: Log all dashboard API calls
2. **Error Tracking**: Monitor failed requests and database errors
3. **Performance Metrics**: Track response times and database query performance
4. **User Activity**: Monitor admin dashboard usage patterns

## Future Enhancements

1. **Real-time Notifications**: WebSocket integration for live updates
2. **Advanced Analytics**: More detailed charts and reports
3. **Export Functionality**: PDF/Excel export of dashboard data
4. **Customizable Dashboard**: Allow admins to customize dashboard layout
5. **Scheduled Announcements**: Future-dated announcements
6. **Announcement Templates**: Pre-defined announcement templates
7. **Multi-language Support**: Internationalization for announcements
8. **Dashboard Widgets**: Configurable dashboard widgets

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if admin token is valid and not expired
2. **403 Forbidden**: Verify user has admin role
3. **Empty Dashboard**: Check if database has data
4. **Announcement Creation Failed**: Verify email service is configured

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API endpoints are accessible
3. Check database connections
4. Validate JWT token format
5. Test email service configuration

## Dependencies

### Backend
- Express.js
- Sequelize ORM
- JWT for authentication
- Nodemailer for email sending

### Frontend
- Next.js
- React hooks
- Heroicons
- Tailwind CSS
- ResponsiveAlert component
- LoadingSpinner component 