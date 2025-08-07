# Members Management API Documentation

## Overview

The Members Management API provides comprehensive management features for members with active membership plans in the Kramz Fitness Hub system. It includes compensation functionality for gym unavailability, membership extensions, and detailed member analytics.

## Features

### 👥 Member Management
- **Active Members Tracking** - Monitor all members with active membership plans
- **Member Details** - View comprehensive member information and statistics
- **Search & Filter** - Find members by name, email, or membership type
- **Status Monitoring** - Track remaining days and membership status

### 🎯 Compensation System
- **Individual Compensation** - Add compensation days for specific members
- **Bulk Compensation** - Apply compensation to multiple members simultaneously
- **Compensation History** - Track all compensation records and reasons
- **Automatic Extension** - Extend membership end dates based on compensation

### 📊 Analytics & Reporting
- **Member Statistics** - Total active members, expiring soon, compensation totals
- **Membership Type Analysis** - Distribution of members by membership type
- **Compensation Tracking** - Monitor compensation patterns and reasons
- **Real-time Updates** - Live data updates for member status

### 🔧 Technical Features
- **RESTful API** - Complete backend with proper HTTP methods
- **Authentication** - JWT-based admin authentication
- **Database Integration** - Sequelize ORM with optimized queries
- **Error Handling** - Comprehensive error handling and validation
- **Performance Optimization** - Efficient data aggregation and filtering

## API Endpoints

### Base URL
```
/api/members-management
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Get all members with active membership plans |
| `/statistics` | GET | Get members statistics and analytics |
| `/:member_membership_id` | GET | Get detailed member information |
| `/:member_membership_id/compensation` | POST | Add compensation for a member |
| `/:member_membership_id/extend` | PUT | Extend membership for a member |
| `/:member_membership_id/compensation-history` | GET | Get compensation history for a member |
| `/bulk-compensation` | POST | Add compensation for multiple members |

## Authentication

All endpoints require authentication with admin role:

```
Authorization: Bearer <jwt_token>
```

## Endpoint Details

### 1. Get All Members
**GET** `/`

Returns all members with active membership plans and optional filtering.

**Query Parameters:**
- `search` (optional): Search by member name or email
- `membership_type` (optional): Filter by membership type ID

**Response:**
```json
[
  {
    "member_membership_id": 1,
    "member_id": 1,
    "membership_id": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-02-01",
    "plan_status": "active",
    "remainingDays": 15,
    "totalCompensationDays": 5,
    "effectiveEndDate": "2024-02-06",
    "member": {
      "member_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "contact_number": "+1234567890",
      "user": {
        "email": "john@example.com",
        "status": "active"
      }
    },
    "membershipType": {
      "name": "Premium Monthly",
      "price": 1500.00,
      "duration_days": 30,
      "description": "Full access to all facilities"
    },
    "compensations": [
      {
        "compensation_id": 1,
        "compensation_days": 3,
        "reason": "Gym maintenance",
        "status": "applied"
      }
    ]
  }
]
```

### 2. Get Members Statistics
**GET** `/statistics`

Returns comprehensive statistics about members and compensation.

**Response:**
```json
{
  "totalActiveMembers": 25,
  "expiringSoon": 3,
  "totalCompensations": 15,
  "membersByMembershipType": [
    {
      "membership_name": "Premium Monthly",
      "count": 15
    },
    {
      "membership_name": "Basic Monthly",
      "count": 10
    }
  ]
}
```

### 3. Get Member Details
**GET** `/:member_membership_id`

Returns detailed information about a specific member.

**Response:**
```json
{
  "member_membership_id": 1,
  "member_id": 1,
  "membership_id": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-02-01",
  "plan_status": "active",
  "remainingDays": 15,
  "totalCompensationDays": 5,
  "effectiveEndDate": "2024-02-06",
  "member": {
    "member_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "contact_number": "+1234567890",
    "user": {
      "email": "john@example.com",
      "status": "active"
    }
  },
  "membershipType": {
    "name": "Premium Monthly",
    "price": 1500.00,
    "duration_days": 30,
    "description": "Full access to all facilities"
  },
  "compensations": [
    {
      "compensation_id": 1,
      "compensation_days": 3,
      "reason": "Gym maintenance",
      "compensation_date": "2024-01-15",
      "status": "applied",
      "notes": "Equipment upgrade",
      "appliedBy": {
        "email": "admin@kramzfitness.com"
      }
    }
  ],
  "attendance": [
    {
      "attendance_id": 1,
      "date": "2024-01-20",
      "status": "present"
    }
  ]
}
```

### 4. Add Compensation
**POST** `/:member_membership_id/compensation`

Adds compensation days for a specific member.

**Request Body:**
```json
{
  "compensation_days": 3,
  "reason": "Gym maintenance - Equipment upgrade",
  "compensation_date": "2024-01-15",
  "notes": "Gym was closed for 3 days due to equipment maintenance"
}
```

**Response:**
```json
{
  "message": "Compensation added successfully.",
  "compensation": {
    "compensation_id": 1,
    "member_membership_id": 1,
    "compensation_days": 3,
    "reason": "Gym maintenance - Equipment upgrade",
    "compensation_date": "2024-01-15",
    "status": "applied",
    "notes": "Gym was closed for 3 days due to equipment maintenance"
  }
}
```

### 5. Extend Membership
**PUT** `/:member_membership_id/extend`

Extends a member's membership by specified days.

**Request Body:**
```json
{
  "extension_days": 7,
  "reason": "Special promotion"
}
```

**Response:**
```json
{
  "message": "Membership extended successfully.",
  "newEndDate": "2024-02-08"
}
```

### 6. Get Compensation History
**GET** `/:member_membership_id/compensation-history`

Returns all compensation records for a specific member.

**Response:**
```json
[
  {
    "compensation_id": 1,
    "compensation_days": 3,
    "reason": "Gym maintenance",
    "compensation_date": "2024-01-15",
    "status": "applied",
    "notes": "Equipment upgrade",
    "created_at": "2024-01-15T10:30:00.000Z",
    "appliedBy": {
      "email": "admin@kramzfitness.com"
    }
  }
]
```

### 7. Bulk Add Compensation
**POST** `/bulk-compensation`

Adds compensation for multiple members simultaneously.

**Request Body:**
```json
{
  "member_membership_ids": [1, 2, 3],
  "compensation_days": 2,
  "reason": "Holiday closure",
  "compensation_date": "2024-01-01",
  "notes": "Gym closed for New Year holiday"
}
```

**Response:**
```json
{
  "message": "Compensation added successfully for 3 members.",
  "compensations": [
    {
      "compensation_id": 1,
      "member_membership_id": 1,
      "compensation_days": 2,
      "reason": "Holiday closure",
      "status": "applied"
    }
  ]
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Access denied."
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required."
}
```

### 404 Not Found
```json
{
  "message": "Member membership not found."
}
```

### 400 Bad Request
```json
{
  "message": "Compensation days, reason, and date are required."
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to fetch members data.",
  "error": "Error details"
}
```

## Database Schema

### Compensations Table
```sql
CREATE TABLE compensations (
  compensation_id INT AUTO_INCREMENT PRIMARY KEY,
  member_membership_id INT NOT NULL,
  compensation_days INT NOT NULL DEFAULT 0,
  reason VARCHAR(255) NOT NULL,
  compensation_date DATE NOT NULL,
  applied_by INT NOT NULL,
  status ENUM('pending', 'applied', 'expired') DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_membership_id) REFERENCES member_memberships(member_membership_id),
  FOREIGN KEY (applied_by) REFERENCES users(user_id)
);
```

### Member Memberships Table
```sql
CREATE TABLE member_memberships (
  member_membership_id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  membership_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  plan_status ENUM('pending', 'active', 'expired') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(member_id),
  FOREIGN KEY (membership_id) REFERENCES membership_types(membership_id)
);
```

## Usage Examples

### Frontend Integration

```javascript
// Fetch all members
const response = await fetch('/api/members-management', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Add compensation for a member
const compensationResponse = await fetch('/api/members-management/1/compensation', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    compensation_days: 3,
    reason: 'Gym maintenance',
    compensation_date: '2024-01-15',
    notes: 'Equipment upgrade'
  })
});

// Bulk compensation
const bulkResponse = await fetch('/api/members-management/bulk-compensation', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    member_membership_ids: [1, 2, 3],
    compensation_days: 2,
    reason: 'Holiday closure',
    compensation_date: '2024-01-01'
  })
});
```

## Performance Considerations

### Database Indexes
- Index on `member_membership_id` for relationship queries
- Index on `applied_by` for user relationship queries
- Index on `status` for compensation filtering
- Composite index on `(member_membership_id, status)` for active compensations

### Query Optimization
- Use aggregation functions for statistics
- Implement pagination for large member lists
- Cache frequently accessed member data
- Use database views for complex member analytics

## Security Features

### Authentication
- JWT token validation
- Role-based access control (admin only)
- Token expiration handling

### Data Validation
- Input sanitization
- SQL injection prevention
- Date format validation
- Numeric value validation

## Monitoring and Logging

### Recommended Metrics
- API response times
- Error rates by endpoint
- Member data access patterns
- Compensation application frequency

### Logging
- Authentication attempts
- Compensation applications
- Membership extensions
- Error occurrences

## Future Enhancements

### Planned Features
- Export functionality (PDF, Excel)
- Advanced filtering options
- Real-time member notifications
- Automated compensation scheduling
- Member communication system
- Advanced analytics dashboard

### Technical Improvements
- GraphQL API support
- WebSocket real-time updates
- Advanced caching strategies
- Machine learning for member behavior
- Mobile app integration
- API rate limiting 