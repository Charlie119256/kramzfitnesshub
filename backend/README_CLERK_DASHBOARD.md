# Clerk Dashboard Backend

## Overview

The Clerk Dashboard provides comprehensive analytics and management features for clerks in the Kramz Fitness Hub system. Clerks have access to most dashboard features but with read-only permissions for announcements, ensuring proper role-based access control.

## Features Implemented

### 📊 Analytics & Reporting
- **Total Earnings** - Track revenue from membership payments with monthly breakdown
- **Member Analytics** - Count active members, total accounts, and membership status
- **Staff Management** - Track total staff including admins and clerks
- **Equipment Inventory** - Monitor equipment status and availability
- **Expiration Tracking** - Identify memberships expiring soon and already expired
- **Gender Distribution** - Analyze membership by gender demographics
- **Financial Reports** - Detailed earnings and expenses with date filtering

### 🔧 Technical Features
- **RESTful API** - Complete backend with proper HTTP methods
- **Authentication** - JWT-based clerk/admin authentication
- **Database Integration** - Sequelize ORM with optimized queries
- **Error Handling** - Comprehensive error handling and validation
- **Performance Optimization** - Parallel queries and efficient data aggregation
- **Role-Based Access** - Proper permissions for clerks vs admins

## API Endpoints

### Base URL
```
/api/clerk-dashboard
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/earnings` | GET | Total earnings and monthly breakdown |
| `/members-with-membership` | GET | Count of members with active memberships |
| `/member-accounts` | GET | Total member accounts with active/inactive breakdown |
| `/staff` | GET | Total staff count (admins + clerks) |
| `/equipment` | GET | Equipment statistics with status breakdown |
| `/expiring-soon` | GET | Memberships expiring within 30 days |
| `/expired-members` | GET | Memberships that have already expired |
| `/earnings-expenses-report` | GET | Detailed financial report with date filtering |
| `/membership-by-gender` | GET | Membership distribution by gender |
| `/announcements` | GET | Latest announcements (read-only) |
| `/dashboard-data` | GET | All metrics in single request (optimized) |

## Key Differences from Admin Dashboard

### 🔐 Permissions
- **Clerks**: Can view all dashboard data but cannot create announcements
- **Admins**: Can view all dashboard data and create announcements

### 📢 Announcement Access
- **Clerks**: Read-only access to announcements
- **Admins**: Full CRUD access to announcements

### 🏋️ Equipment Management
- **Clerks**: Can view equipment status and statistics
- **Admins**: Can view and manage equipment (create, update, delete)

### 👥 Staff Management
- **Clerks**: Can view staff statistics
- **Admins**: Can view and manage staff accounts

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
const getClerkDashboardData = async () => {
  try {
    const response = await fetch('/api/clerk-dashboard/dashboard-data', {
      headers: {
        'Authorization': `Bearer ${clerkToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update dashboard UI
      updateClerkDashboard(data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Get Financial Report with Date Filtering
```javascript
const getClerkFinancialReport = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`/api/clerk-dashboard/earnings-expenses-report?${params}`, {
      headers: {
        'Authorization': `Bearer ${clerkToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update financial charts
      updateFinancialCharts(data);
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
curl -X GET "http://localhost:5001/api/clerk-dashboard/dashboard-data" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"

# Get earnings with date filtering
curl -X GET "http://localhost:5001/api/clerk-dashboard/earnings-expenses-report?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"
```

## Response Formats

### Dashboard Data Response
```json
{
  "totalEarnings": 50000.00,
  "totalMembersWithMembership": 45,
  "totalMemberAccounts": 50,
  "totalStaff": 8,
  "totalEquipment": 25,
  "expiringSoon": 3,
  "expiredMembers": 2,
  "membershipByGender": [
    {
      "gender": "male",
      "count": 25
    },
    {
      "gender": "female",
      "count": 20
    }
  ],
  "recentAnnouncements": [
    {
      "announcement_id": 1,
      "title": "New Equipment Arrival",
      "message": "New treadmills have been installed.",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Financial Report Response
```json
{
  "earnings": [
    {
      "date": "2024-01-15",
      "total": 2500.00
    }
  ],
  "expenses": [
    {
      "date": "2024-01-10",
      "total": 1500.00
    }
  ],
  "totalEarnings": 50000.00,
  "totalExpenses": 15000.00,
  "netProfit": 35000.00
}
```

## Security Features

### Authentication
- All endpoints require clerk or admin JWT token
- Role-based access control
- Token validation middleware

### Error Handling
- Comprehensive error responses
- Input validation
- SQL injection prevention

### Performance
- Optimized database queries
- Parallel execution where possible
- Efficient data aggregation

## Role-Based Access Control

### Clerk Permissions
- ✅ View all dashboard metrics
- ✅ View financial reports
- ✅ View member statistics
- ✅ View equipment status
- ✅ View announcements (read-only)
- ❌ Create announcements
- ❌ Manage staff accounts
- ❌ Manage equipment

### Admin Permissions
- ✅ All clerk permissions
- ✅ Create announcements
- ✅ Manage staff accounts
- ✅ Manage equipment
- ✅ Full system access

## Database Queries

### Key Queries Used
1. **Earnings Calculation**: SUM of receipt amounts
2. **Active Memberships**: COUNT with date range filtering
3. **Staff Count**: COUNT with role filtering
4. **Equipment Status**: COUNT with status grouping
5. **Expiring Memberships**: Date range queries with JOINs
6. **Gender Distribution**: GROUP BY with aggregation

### Performance Optimizations
- Indexed foreign keys
- Efficient JOIN operations
- Parallel query execution
- Cached aggregation results

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (not clerk/admin) |
| 500 | Internal server error |

## Development Notes

### Adding New Metrics
1. Add new method to `clerkDashboardController.js`
2. Add route to `clerkDashboardRoutes.js`
3. Update documentation
4. Ensure proper role-based access

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
- Role-based access testing

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure clerk token is valid
   - Check token expiration
   - Verify clerk role in database

2. **Permission Errors**
   - Verify user has clerk or admin role
   - Check if trying to perform admin-only actions

3. **Database Connection Issues**
   - Check MySQL service status
   - Verify database credentials
   - Test connection with `sequelize.authenticate()`

4. **Performance Issues**
   - Check database indexes
   - Monitor query execution time
   - Consider caching for frequently accessed data

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

## Integration with Admin Dashboard

The clerk dashboard shares the same data structure as the admin dashboard, ensuring consistency across the system. The main differences are:

1. **Permissions**: Clerks have read-only access to certain features
2. **Endpoints**: Same endpoints but with different access control
3. **Data**: Same data structure for consistency

## Future Enhancements

### Planned Features
- Real-time dashboard updates with WebSocket
- Advanced analytics with charts and graphs
- Export functionality (PDF, Excel)
- Automated reporting schedules
- Mobile dashboard optimization

### Performance Improvements
- Redis caching for frequently accessed data
- Database query optimization
- Pagination for large datasets
- Lazy loading for dashboard components

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