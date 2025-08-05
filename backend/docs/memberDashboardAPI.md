# Member Dashboard API Documentation

## Overview
The Member Dashboard API provides personalized features for gym members in the Kramz Fitness Hub system. Members can view their membership details, workout statistics, attendance history, and announcements.

## Base URL
```
/api/member-dashboard
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Access Control
- **Members**: Full access to all member dashboard features
- **Admins/Clerks**: No access to member dashboard
- **Unauthorized**: No access

## Endpoints

### 1. Get Membership Plan
**GET** `/membership-plan`

Returns the member's current active membership plan details.

**Response:**
```json
{
  "hasActiveMembership": true,
  "membership": {
    "member_membership_id": 1,
    "member_id": 1,
    "membership_id": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-02-01",
    "plan_status": "active",
    "membershipType": {
      "name": "Premium Monthly",
      "description": "Full access to all facilities",
      "duration_days": 30,
      "price": 1500.00
    }
  }
}
```

### 2. Get Remaining Days
**GET** `/remaining-days`

Returns the remaining days in the member's current membership plan.

**Response:**
```json
{
  "hasActiveMembership": true,
  "remainingDays": 15,
  "totalDays": 30,
  "endDate": "2024-02-01",
  "membershipName": "Premium Monthly"
}
```

### 3. Get Total Workout Days
**GET** `/workout-days`

Returns total workout days and monthly attendance statistics.

**Response:**
```json
{
  "totalWorkoutDays": 25,
  "monthlyAttendance": [
    {
      "month": 1,
      "count": 8
    },
    {
      "month": 2,
      "count": 12
    }
  ],
  "recentAttendance": [
    {
      "attendance_id": 1,
      "member_id": 1,
      "date": "2024-01-15",
      "time_in": "2024-01-15T08:00:00Z",
      "time_out": "2024-01-15T10:00:00Z",
      "status": "present"
    }
  ],
  "currentYear": 2024
}
```

### 4. Get Attendance with Filtering
**GET** `/attendance`

Returns attendance records with optional date filtering and pagination.

**Query Parameters:**
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of records per page (default: 20)

**Response:**
```json
{
  "attendance": [
    {
      "attendance_id": 1,
      "member_id": 1,
      "date": "2024-01-15",
      "time_in": "2024-01-15T08:00:00Z",
      "time_out": "2024-01-15T10:00:00Z",
      "status": "present",
      "memberMembership": {
        "membershipType": {
          "name": "Premium Monthly"
        }
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  },
  "statistics": {
    "totalSessions": 25,
    "uniqueDays": 25,
    "avgSessionDuration": 120
  },
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

### 5. Get Announcements
**GET** `/announcements`

Returns announcements targeted to members.

**Response:**
```json
{
  "announcements": [
    {
      "announcement_id": 1,
      "title": "New Equipment Arrival",
      "message": "New treadmills have been installed.",
      "target_audience": "all",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

### 6. Get Comprehensive Dashboard Data
**GET** `/dashboard-data`

Returns all dashboard metrics in a single request for optimal performance.

**Response:**
```json
{
  "hasActiveMembership": true,
  "membership": {
    "member_membership_id": 1,
    "member_id": 1,
    "membership_id": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-02-01",
    "plan_status": "active",
    "membershipType": {
      "name": "Premium Monthly",
      "description": "Full access to all facilities",
      "duration_days": 30,
      "price": 1500.00
    }
  },
  "remainingDays": 15,
  "totalWorkoutDays": 25,
  "recentAttendance": [
    {
      "attendance_id": 1,
      "member_id": 1,
      "date": "2024-01-15",
      "time_in": "2024-01-15T08:00:00Z",
      "time_out": "2024-01-15T10:00:00Z",
      "status": "present"
    }
  ],
  "announcements": [
    {
      "announcement_id": 1,
      "title": "New Equipment Arrival",
      "message": "New treadmills have been installed.",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "memberInfo": {
    "member_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "member_code": "KFH-20240001"
  }
}
```

### 7. Get Workout Streak
**GET** `/workout-streak`

Returns the member's current and longest workout streaks.

**Response:**
```json
{
  "currentStreak": 5,
  "longestStreak": 12,
  "totalWorkoutDays": 25
}
```

## Error Responses

### 403 Forbidden
```json
{
  "message": "Access denied. Only members can access this feature."
}
```

### 404 Not Found
```json
{
  "message": "Member profile not found."
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to fetch dashboard data.",
  "error": "Error details"
}
```

## Usage Examples

### Frontend Integration Example (JavaScript)
```javascript
// Get comprehensive dashboard data
const getMemberDashboardData = async () => {
  try {
    const response = await fetch('/api/member-dashboard/dashboard-data', {
      headers: {
        'Authorization': `Bearer ${memberToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update dashboard UI with data
      updateMemberDashboard(data);
    }
  } catch (error) {
    console.error('Error fetching member dashboard data:', error);
  }
};

// Get attendance with date filtering
const getAttendanceWithFilter = async (startDate, endDate, page = 1) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page);
    
    const response = await fetch(`/api/member-dashboard/attendance?${params}`, {
      headers: {
        'Authorization': `Bearer ${memberToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update attendance list
      updateAttendanceList(data);
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
  }
};

// Get workout streak
const getWorkoutStreak = async () => {
  try {
    const response = await fetch('/api/member-dashboard/workout-streak', {
      headers: {
        'Authorization': `Bearer ${memberToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update streak display
      updateStreakDisplay(data);
    }
  } catch (error) {
    console.error('Error fetching workout streak:', error);
  }
};
```

## Performance Notes

1. **Use `/dashboard-data` endpoint** for initial dashboard load to get all metrics in one request
2. **Use individual endpoints** for specific data updates or filtering
3. **Implement caching** on the frontend for better performance
4. **Use date filtering** for large attendance datasets
5. **Use pagination** for attendance history to improve performance

## Security Considerations

1. All endpoints require member authentication
2. JWT tokens should be stored securely
3. Implement rate limiting for production use
4. Validate all input parameters
5. Log member actions for audit purposes

## Member-Specific Features

### Membership Tracking
- View current membership plan details
- Track remaining days in membership
- Monitor membership expiration

### Workout Statistics
- Total workout days count
- Monthly attendance breakdown
- Recent workout sessions
- Workout streaks (current and longest)

### Attendance Management
- View attendance history with date filtering
- Pagination for large datasets
- Attendance statistics and analytics
- Session duration tracking

### Communication
- View announcements targeted to members
- Real-time updates for new announcements

## Data Privacy

### Member Data Protection
- Members can only access their own data
- No cross-member data access
- Secure authentication required
- Data encryption in transit

### Personal Information
- Member profile information
- Attendance records
- Membership details
- Workout statistics

## Integration with Other Dashboards

The member dashboard is designed to work alongside the admin and clerk dashboards:

1. **Admin Dashboard**: Can view all member data and manage memberships
2. **Clerk Dashboard**: Can view member statistics and assist with membership issues
3. **Member Dashboard**: Personal view of own data and statistics

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure member token is valid
   - Check token expiration
   - Verify member role in database

2. **Permission Errors**
   - Verify user has member role
   - Check if trying to access admin/clerk features

3. **Data Accuracy Issues**
   - Verify model associations
   - Check foreign key constraints
   - Validate date formats

4. **Performance Issues**
   - Use pagination for large datasets
   - Implement caching for frequently accessed data
   - Use date filtering for attendance queries

## Support

For issues or questions:
1. Check the API documentation
2. Review error logs
3. Verify database schema and data integrity
4. Test with different user roles

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Author**: Kramz Fitness Hub Development Team 