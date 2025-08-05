# Admin Dashboard API Documentation

## Overview
The Admin Dashboard API provides comprehensive analytics and management features for the Kramz Fitness Hub system. All endpoints require admin authentication.

## Base URL
```
/api/admin-dashboard
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Total Earnings
**GET** `/earnings`

Returns total earnings from membership payments and monthly breakdown.

**Response:**
```json
{
  "totalEarnings": 50000.00,
  "monthlyEarnings": [
    {
      "month": 1,
      "total": 8500.00
    },
    {
      "month": 2,
      "total": 9200.00
    }
  ]
}
```

### 2. Get Total Members with Membership
**GET** `/members-with-membership`

Returns count of members with active memberships.

**Response:**
```json
{
  "totalMembersWithMembership": 45
}
```

### 3. Get Total Member Accounts
**GET** `/member-accounts`

Returns total member accounts with active/inactive breakdown.

**Response:**
```json
{
  "totalMemberAccounts": 50,
  "activeMemberAccounts": 45,
  "inactiveMemberAccounts": 5
}
```

### 4. Get Total Staff
**GET** `/staff`

Returns total staff count including admins and clerks.

**Response:**
```json
{
  "totalStaff": 8,
  "totalClerks": 6,
  "totalAdmins": 2
}
```

### 5. Get Total Equipment
**GET** `/equipment`

Returns equipment statistics with status breakdown.

**Response:**
```json
{
  "totalEquipment": 25,
  "availableEquipment": 20,
  "maintenanceEquipment": 3,
  "unavailableEquipment": 2
}
```

### 6. Get Expiring Soon Memberships
**GET** `/expiring-soon`

Returns memberships expiring within 30 days.

**Response:**
```json
{
  "expiringSoon": [
    {
      "member_membership_id": 1,
      "member_id": 1,
      "membership_id": 1,
      "start_date": "2024-01-01",
      "end_date": "2024-02-15",
      "plan_status": "active",
      "member": {
        "member_id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "user": {
          "email": "john@example.com"
        }
      },
      "membershipType": {
        "name": "Premium Monthly",
        "duration_days": 30
      }
    }
  ],
  "count": 1
}
```

### 7. Get Expired Members
**GET** `/expired-members`

Returns memberships that have already expired.

**Response:**
```json
{
  "expiredMembers": [
    {
      "member_membership_id": 2,
      "member_id": 2,
      "membership_id": 1,
      "start_date": "2023-12-01",
      "end_date": "2024-01-01",
      "plan_status": "active",
      "member": {
        "member_id": 2,
        "first_name": "Jane",
        "last_name": "Smith",
        "user": {
          "email": "jane@example.com"
        }
      },
      "membershipType": {
        "name": "Premium Monthly",
        "duration_days": 30
      }
    }
  ],
  "count": 1
}
```

### 8. Get Earnings and Expenses Report
**GET** `/earnings-expenses-report`

Returns detailed earnings and expenses report with optional date filtering.

**Query Parameters:**
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)

**Response:**
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

### 9. Get Membership by Gender
**GET** `/membership-by-gender`

Returns membership distribution by gender.

**Response:**
```json
{
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
  "totalActiveMemberships": 45
}
```

### 10. Get Announcements
**GET** `/announcements`

Returns latest announcements for the dashboard.

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

### 11. Get Comprehensive Dashboard Data
**GET** `/dashboard-data`

Returns all dashboard metrics in a single request for optimal performance.

**Response:**
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

## Error Responses

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
  "error": "Error details"
}
```

## Usage Examples

### Frontend Integration Example (JavaScript)
```javascript
// Get comprehensive dashboard data
const getDashboardData = async () => {
  try {
    const response = await fetch('/api/admin-dashboard/dashboard-data', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update dashboard UI with data
      updateDashboard(data);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

// Get earnings with date filtering
const getEarningsReport = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`/api/admin-dashboard/earnings-expenses-report?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update earnings chart
      updateEarningsChart(data);
    }
  } catch (error) {
    console.error('Error fetching earnings report:', error);
  }
};
```

## Performance Notes

1. **Use `/dashboard-data` endpoint** for initial dashboard load to get all metrics in one request
2. **Use individual endpoints** for specific data updates or filtering
3. **Implement caching** on the frontend for better performance
4. **Use date filtering** for large datasets in earnings/expenses reports

## Security Considerations

1. All endpoints require admin authentication
2. JWT tokens should be stored securely
3. Implement rate limiting for production use
4. Validate all input parameters
5. Log admin actions for audit purposes 