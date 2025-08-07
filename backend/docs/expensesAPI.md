# Expenses API Documentation

## Overview

The Expenses API provides comprehensive analytics and management features for equipment expenses in the Kramz Fitness Hub system. It tracks equipment purchases, provides detailed analytics, trends analysis, and forecasting capabilities.

## Features

### 📊 Analytics & Reporting
- **Total Expenses Tracking** - Monitor total equipment expenses with detailed breakdowns
- **Category Analysis** - Analyze expenses by equipment categories
- **Monthly Trends** - Track monthly expense patterns
- **Year-over-Year Comparison** - Compare expenses across different years
- **Forecasting** - Predict future expenses based on historical data
- **Status Tracking** - Monitor equipment status and maintenance costs

### 🔧 Technical Features
- **RESTful API** - Complete backend with proper HTTP methods
- **Authentication** - JWT-based admin/clerk authentication
- **Database Integration** - Sequelize ORM with optimized queries
- **Error Handling** - Comprehensive error handling and validation
- **Performance Optimization** - Efficient data aggregation and filtering

## API Endpoints

### Base URL
```
/api/expenses
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Get all expenses with filtering |
| `/analytics` | GET | Get expenses analytics and summary |
| `/:equipment_id` | GET | Get expense details by ID |
| `/trends/analysis` | GET | Get expense trends and year-over-year comparison |
| `/forecast/prediction` | GET | Get expense forecast based on historical data |

## Authentication

All endpoints require authentication with admin or clerk role:

```
Authorization: Bearer <jwt_token>
```

## Endpoint Details

### 1. Get All Expenses
**GET** `/`

Returns all equipment expenses with optional filtering.

**Query Parameters:**
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)
- `category_id` (optional): Filter by equipment category
- `status` (optional): Filter by equipment status

**Response:**
```json
[
  {
    "equipment_id": 1,
    "name": "Treadmill Pro",
    "category_id": 1,
    "quantity": 2,
    "condition": "Excellent",
    "price": 45000.00,
    "purchase_date": "2024-01-15",
    "status": "available",
    "category": {
      "category_id": 1,
      "name": "Cardio Equipment"
    }
  }
]
```

### 2. Get Expenses Analytics
**GET** `/analytics`

Returns comprehensive analytics and summary data.

**Query Parameters:**
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)

**Response:**
```json
{
  "totalExpenses": 250000.00,
  "expensesByCategory": [
    {
      "category_name": "Cardio Equipment",
      "total_amount": 108000.00,
      "item_count": 3
    }
  ],
  "monthlyExpenses": [
    {
      "month": 1,
      "total_amount": 45000.00,
      "item_count": 1
    }
  ],
  "expensesByStatus": [
    {
      "status": "available",
      "total_amount": 240000.00,
      "item_count": 9
    }
  ],
  "recentExpenses": [
    {
      "equipment_id": 10,
      "name": "Foam Rollers",
      "price": 2000.00,
      "purchase_date": "2024-08-15",
      "category": {
        "name": "Accessories"
      }
    }
  ]
}
```

### 3. Get Expense Details
**GET** `/:equipment_id`

Returns detailed information about a specific expense.

**Response:**
```json
{
  "equipment_id": 1,
  "name": "Treadmill Pro",
  "category_id": 1,
  "quantity": 2,
  "condition": "Excellent",
  "price": 45000.00,
  "purchase_date": "2024-01-15",
  "status": "available",
  "category": {
    "category_id": 1,
    "name": "Cardio Equipment"
  }
}
```

### 4. Get Expense Trends
**GET** `/trends/analysis`

Returns year-over-year comparison and trend analysis.

**Query Parameters:**
- `year` (optional): Target year for analysis (default: current year)

**Response:**
```json
{
  "currentYear": 2024,
  "previousYear": 2023,
  "monthlyExpenses": [
    {
      "month": 1,
      "total_amount": 45000.00,
      "item_count": 1
    }
  ],
  "previousYearExpenses": [
    {
      "month": 1,
      "total_amount": 28000.00
    }
  ],
  "currentYearTotal": 250000.00,
  "previousYearTotal": 180000.00,
  "percentageChange": 38.9
}
```

### 5. Get Expense Forecast
**GET** `/forecast/prediction`

Returns expense forecast based on historical data.

**Query Parameters:**
- `months` (optional): Number of months to forecast (default: 6)

**Response:**
```json
{
  "historicalData": [
    {
      "month": 1,
      "year": 2024,
      "total_amount": 45000.00
    }
  ],
  "averageMonthlyExpense": 20833.33,
  "forecast": [
    {
      "month": 9,
      "year": 2024,
      "monthName": "September 2024",
      "predictedAmount": 20833.33,
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
  "message": "Access denied."
}
```

### 404 Not Found
```json
{
  "message": "Expense not found."
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to fetch expenses.",
  "error": "Error details"
}
```

## Database Schema

### Equipment Table
```sql
CREATE TABLE equipment (
  equipment_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category_id INT,
  quantity INT NOT NULL,
  condition VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  purchase_date DATE NOT NULL,
  status ENUM('available', 'under_maintenance') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES equipment_categories(category_id)
);
```

### Equipment Categories Table
```sql
CREATE TABLE equipment_categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Usage Examples

### Frontend Integration

```javascript
// Fetch all expenses
const response = await fetch('/api/expenses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Fetch analytics with date filtering
const analyticsResponse = await fetch('/api/expenses/analytics?startDate=2024-01-01&endDate=2024-12-31', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Get trends analysis
const trendsResponse = await fetch('/api/expenses/trends/analysis?year=2024', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Performance Considerations

### Database Indexes
- Index on `purchase_date` for date filtering
- Index on `category_id` for category filtering
- Index on `status` for status filtering
- Composite index on `(purchase_date, category_id)` for analytics queries

### Query Optimization
- Use aggregation functions for analytics
- Implement pagination for large datasets
- Cache frequently accessed analytics data
- Use database views for complex aggregations

## Security Features

### Authentication
- JWT token validation
- Role-based access control (admin/clerk only)
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
- Real-time expense tracking
- Budget management integration
- Maintenance cost tracking
- Depreciation calculations

### Technical Improvements
- GraphQL API support
- WebSocket real-time updates
- Advanced caching strategies
- Machine learning for forecasting
- Mobile app integration 