# Earnings API Documentation

## Overview

The Earnings API provides comprehensive analytics and management features for membership earnings in the Kramz Fitness Hub system. It tracks earnings from membership payments, provides detailed analytics, trends analysis, and forecasting capabilities.

## Features

### 📊 Analytics & Reporting
- **Total Earnings Tracking** - Monitor total earnings from membership payments
- **Membership Type Analysis** - Analyze earnings by membership types
- **Monthly Trends** - Track monthly earnings patterns
- **Year-over-Year Comparison** - Compare earnings across different years
- **Forecasting** - Predict future earnings based on historical data
- **Payment Method Tracking** - Monitor earnings by payment method

### 🔧 Technical Features
- **RESTful API** - Complete backend with proper HTTP methods
- **Authentication** - JWT-based admin authentication
- **Database Integration** - Sequelize ORM with optimized queries
- **Error Handling** - Comprehensive error handling and validation
- **Performance Optimization** - Efficient data aggregation and filtering

## API Endpoints

### Base URL
```
/api/earnings
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Get all earnings with filtering |
| `/analytics` | GET | Get earnings analytics and summary |
| `/:receipt_id` | GET | Get earnings details by receipt ID |
| `/trends/analysis` | GET | Get earnings trends and year-over-year comparison |
| `/forecast/prediction` | GET | Get earnings forecast based on historical data |

## Authentication

All endpoints require authentication with admin role:

```
Authorization: Bearer <jwt_token>
```

## Endpoint Details

### 1. Get All Earnings
**GET** `/`

Returns all earnings with optional filtering.

**Query Parameters:**
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)
- `membership_id` (optional): Filter by membership type
- `payment_method` (optional): Filter by payment method

**Response:**
```json
[
  {
    "receipt_id": 1,
    "member_membership_id": 1,
    "issued_at": "2024-01-15T10:30:00.000Z",
    "amount": 1500.00,
    "payment_method": "cash",
    "reference_number": "REF-123456789",
    "details": "Payment for Premium Monthly membership",
    "memberMembership": {
      "member_membership_id": 1,
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
        "price": 1500.00,
        "duration_days": 30
      }
    }
  }
]
```

### 2. Get Earnings Analytics
**GET** `/analytics`

Returns comprehensive analytics and summary data.

**Query Parameters:**
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)

**Response:**
```json
{
  "totalEarnings": 50000.00,
  "earningsByMembershipType": [
    {
      "membership_name": "Premium Monthly",
      "total_amount": 30000.00,
      "transaction_count": 20
    }
  ],
  "monthlyEarnings": [
    {
      "month": 1,
      "year": 2024,
      "total_amount": 8500.00,
      "transaction_count": 5
    }
  ],
  "earningsByPaymentMethod": [
    {
      "payment_method": "cash",
      "total_amount": 30000.00,
      "transaction_count": 15
    }
  ],
  "recentEarnings": [
    {
      "receipt_id": 1,
      "amount": 1500.00,
      "issued_at": "2024-01-15T10:30:00.000Z",
      "payment_method": "cash",
      "memberMembership": {
        "member": {
          "first_name": "John",
          "last_name": "Doe"
        },
        "membershipType": {
          "name": "Premium Monthly"
        }
      }
    }
  ]
}
```

### 3. Get Earnings Details
**GET** `/:receipt_id`

Returns detailed information about a specific earnings transaction.

**Response:**
```json
{
  "receipt_id": 1,
  "member_membership_id": 1,
  "issued_at": "2024-01-15T10:30:00.000Z",
  "amount": 1500.00,
  "payment_method": "cash",
  "reference_number": "REF-123456789",
  "details": "Payment for Premium Monthly membership",
  "memberMembership": {
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
      "price": 1500.00,
      "duration_days": 30,
      "description": "Full access to all facilities"
    }
  }
}
```

### 4. Get Earnings Trends
**GET** `/trends/analysis`

Returns year-over-year comparison and trend analysis.

**Query Parameters:**
- `year` (optional): Target year for analysis (default: current year)

**Response:**
```json
{
  "currentYear": 2024,
  "previousYear": 2023,
  "currentYearEarnings": [
    {
      "month": 1,
      "total_amount": 8500.00,
      "transaction_count": 5
    }
  ],
  "previousYearEarnings": [
    {
      "month": 1,
      "total_amount": 6000.00,
      "transaction_count": 4
    }
  ],
  "currentYearTotal": 50000.00,
  "previousYearTotal": 35000.00,
  "percentageChange": 42.9
}
```

### 5. Get Earnings Forecast
**GET** `/forecast/prediction`

Returns earnings forecast based on historical data.

**Query Parameters:**
- `months` (optional): Number of months to forecast (default: 6)

**Response:**
```json
{
  "historicalData": [
    {
      "month": 1,
      "year": 2024,
      "total_amount": 8500.00
    }
  ],
  "averageMonthlyEarnings": 4166.67,
  "forecast": [
    {
      "month": 7,
      "year": 2024,
      "monthName": "July 2024",
      "predictedAmount": 4166.67,
      "confidence": 0.85
    }
  ],
  "confidence": 0.85
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
  "message": "Receipt not found."
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to fetch earnings data.",
  "error": "Error details"
}
```

## Database Schema

### Receipts Table
```sql
CREATE TABLE receipts (
  receipt_id INT PRIMARY KEY AUTO_INCREMENT,
  member_membership_id INT NOT NULL,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
  reference_number VARCHAR(100),
  receipt_url VARCHAR(255),
  details TEXT,
  FOREIGN KEY (member_membership_id) REFERENCES member_memberships(member_membership_id)
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

### Membership Types Table
```sql
CREATE TABLE membership_types (
  membership_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_days INT NOT NULL,
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Usage Examples

### Frontend Integration

```javascript
// Fetch all earnings
const response = await fetch('/api/earnings', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Fetch analytics with date filtering
const analyticsResponse = await fetch('/api/earnings/analytics?startDate=2024-01-01&endDate=2024-12-31', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Get trends analysis
const trendsResponse = await fetch('/api/earnings/trends/analysis?year=2024', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Performance Considerations

### Database Indexes
- Index on `issued_at` for date filtering
- Index on `member_membership_id` for relationship queries
- Index on `payment_method` for payment method filtering
- Composite index on `(issued_at, payment_method)` for analytics queries

### Query Optimization
- Use aggregation functions for analytics
- Implement pagination for large datasets
- Cache frequently accessed analytics data
- Use database views for complex aggregations

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
- Data volume processed
- User access patterns

### Logging
- Authentication attempts
- Data access patterns
- Error occurrences
- Performance metrics

## Future Enhancements

### Planned Features
- Export functionality (PDF, Excel)
- Advanced filtering options
- Real-time earnings tracking
- Budget management integration
- Payment gateway integration
- Automated reporting

### Technical Improvements
- GraphQL API support
- WebSocket real-time updates
- Advanced caching strategies
- Machine learning for forecasting
- Mobile app integration 