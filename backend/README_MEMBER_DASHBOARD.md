# Member Dashboard Backend

## Overview

The Member Dashboard provides personalized features for gym members in the Kramz Fitness Hub system. Members can view their membership details, workout statistics, attendance history, and announcements with full privacy and security.

## Features Implemented

### 📊 Membership Management
- **Membership Plan Details** - View current active membership with plan information
- **Remaining Days** - Track remaining days in membership plan
- **Membership Status** - Monitor active/inactive membership status
- **Plan Information** - View membership type, duration, and pricing

### 🏋️ Workout Statistics
- **Total Workout Days** - Count of total days worked out
- **Monthly Attendance** - Breakdown of attendance by month
- **Recent Sessions** - Latest workout sessions with details
- **Workout Streaks** - Current and longest consecutive workout streaks

### 📅 Attendance Tracking
- **Attendance History** - Complete attendance record with filtering
- **Date Filtering** - Filter attendance by date range
- **Pagination** - Efficient handling of large datasets
- **Session Duration** - Track time spent in gym per session
- **Attendance Analytics** - Statistics and insights

### 📢 Communication
- **Announcements** - View announcements targeted to members
- **Real-time Updates** - Latest announcements and updates
- **Targeted Content** - Member-specific announcements

### 🔧 Technical Features
- **RESTful API** - Complete backend with proper HTTP methods
- **Authentication** - JWT-based member authentication
- **Database Integration** - Sequelize ORM with optimized queries
- **Error Handling** - Comprehensive error handling and validation
- **Performance Optimization** - Parallel queries and efficient data aggregation
- **Data Privacy** - Members can only access their own data

## API Endpoints

### Base URL
```
/api/member-dashboard
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/membership-plan` | GET | Current membership plan details |
| `/remaining-days` | GET | Remaining days in membership |
| `/workout-days` | GET | Total workout days and statistics |
| `/attendance` | GET | Attendance history with filtering |
| `/announcements` | GET | Member announcements |
| `/dashboard-data` | GET | All metrics in single request |
| `/workout-streak` | GET | Current and longest workout streaks |

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
Ensure your MySQL database is running and the tables are created:
```bash
# Check database connection
node -e "require('./config/database').authenticate().then(() => console.log('Connected')).catch(console.error)"
```

### 3. Model Associations
The associations are automatically loaded when the server starts:
```javascript
// In index.js
require('./models/associations');
```

### 4. Start the Server
```bash
npm start
# or
node index.js
```

## Usage Examples

### Frontend Integration

#### Get All Dashboard Data (Recommended)
```javascript
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
    console.error('Error:', error);
  }
};
```

#### Get Attendance with Date Filtering
```javascript
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
    console.error('Error:', error);
  }
};
```

#### Get Workout Streak
```javascript
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
    console.error('Error:', error);
  }
};
```

### Backend Testing

#### Manual Testing with curl
```bash
# Get dashboard data
curl -X GET "http://localhost:5001/api/member-dashboard/dashboard-data" \
  -H "Authorization: Bearer YOUR_MEMBER_TOKEN" \
  -H "Content-Type: application/json"

# Get attendance with date filtering
curl -X GET "http://localhost:5001/api/member-dashboard/attendance?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_MEMBER_TOKEN" \
  -H "Content-Type: application/json"
```

## Response Formats

### Dashboard Data Response
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

### Attendance Response
```json
{
  "attendance": [
    {
      "attendance_id": 1,
      "member_id": 1,
      "date": "2024-01-15",
      "time_in": "2024-01-15T08:00:00Z",
      "time_out": "2024-01-15T10:00:00Z",
      "status": "present"
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
  }
}
```

## Security Features

### Authentication
- All endpoints require member JWT token
- Role-based access control (members only)
- Token validation middleware

### Data Privacy
- Members can only access their own data
- No cross-member data access
- Secure data transmission

### Error Handling
- Comprehensive error responses
- Input validation
- SQL injection prevention

### Performance
- Optimized database queries
- Parallel execution where possible
- Efficient data aggregation
- Pagination for large datasets

## Database Queries

### Key Queries Used
1. **Membership Lookup**: Active membership with plan details
2. **Attendance Counting**: Total workout days calculation
3. **Date Filtering**: Attendance records with date range
4. **Streak Calculation**: Consecutive workout days
5. **Statistics Aggregation**: Monthly and session analytics

### Performance Optimizations
- Indexed foreign keys
- Efficient JOIN operations
- Parallel query execution
- Cached aggregation results
- Pagination for large datasets

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (not member) |
| 404 | Member profile not found |
| 500 | Internal server error |

## Development Notes

### Adding New Features
1. Add new method to `memberDashboardController.js`
2. Add route to `memberDashboardRoutes.js`
3. Update documentation
4. Ensure proper member-only access

### Database Schema Requirements
- Proper foreign key relationships
- Indexed date columns for filtering
- Enum fields for status tracking
- Timestamp fields for analytics

### Testing
- Unit tests for each endpoint
- Integration tests with database
- Performance testing for large datasets
- Security testing for authentication
- Member data privacy testing

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure member token is valid
   - Check token expiration
   - Verify member role in database

2. **Permission Errors**
   - Verify user has member role
   - Check if trying to access admin/clerk features

3. **Database Connection Issues**
   - Check MySQL service status
   - Verify database credentials
   - Test connection with `sequelize.authenticate()`

4. **Performance Issues**
   - Check database indexes
   - Monitor query execution time
   - Consider caching for frequently accessed data
   - Use pagination for large datasets

5. **Data Accuracy Issues**
   - Verify model associations
   - Check foreign key constraints
   - Validate date formats

### Debug Mode
Enable detailed logging:
```javascript
// In index.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

## Integration with Other Dashboards

The member dashboard is designed to work alongside the admin and clerk dashboards:

1. **Admin Dashboard**: Can view all member data and manage memberships
2. **Clerk Dashboard**: Can view member statistics and assist with membership issues
3. **Member Dashboard**: Personal view of own data and statistics

## Future Enhancements

### Planned Features
- Real-time dashboard updates with WebSocket
- Advanced workout analytics with charts
- Export functionality (PDF, Excel)
- Mobile app integration
- Push notifications for announcements

### Performance Improvements
- Redis caching for frequently accessed data
- Database query optimization
- Lazy loading for dashboard components
- Progressive web app features

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