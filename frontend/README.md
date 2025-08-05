# Kramz Fitness Hub Frontend

## Overview

The Kramz Fitness Hub Frontend is a modern, responsive web application built with Next.js and Tailwind CSS. It provides three distinct dashboards for different user roles: Admin, Clerk, and Member.

## Features

### 🎯 **Admin Dashboard**
- **Financial Analytics**: Total earnings, monthly breakdown, and financial reports
- **Member Management**: Active members, total accounts, and membership tracking
- **Staff Management**: Admin and clerk statistics
- **Equipment Tracking**: Inventory status and availability
- **Expiration Alerts**: Memberships expiring soon
- **Announcements**: System-wide communication
- **Gender Analytics**: Membership distribution by gender

### 👥 **Clerk Dashboard**
- **Member Assistance**: Check-in/check-out functionality
- **Equipment Monitoring**: Status tracking and maintenance alerts
- **Attendance Tracking**: Member attendance records
- **Support Tools**: Member information and assistance features
- **Read-only Announcements**: View system announcements

### 🏋️ **Member Dashboard**
- **Membership Details**: Current plan and remaining days
- **Workout Statistics**: Total workout days and attendance history
- **Personal Analytics**: Workout streaks and progress tracking
- **Attendance History**: Detailed workout session records
- **Gym Announcements**: Member-specific communications

## Technology Stack

- **Framework**: Next.js 15.4.5
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons
- **State Management**: React Hooks
- **Routing**: Next.js App Router

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:5001`

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd KRAMZFITNESSHUB/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
```bash
npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Environment Setup

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_APP_NAME=Kramz Fitness Hub
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.js          # Admin Dashboard
│   │   ├── clerk/
│   │   │   └── page.js          # Clerk Dashboard (to be created)
│   │   ├── member/
│   │   │   └── page.js          # Member Dashboard (to be created)
│   │   ├── login/
│   │   │   └── page.js          # Login Page
│   │   ├── layout.js            # Root Layout
│   │   ├── page.js              # Home Page
│   │   └── globals.css          # Global Styles
│   └── components/
│       ├── admin/
│       │   ├── DashboardCard.js
│       │   ├── EarningsChart.js
│       │   ├── MembershipByGender.js
│       │   ├── ExpiringMemberships.js
│       │   └── RecentAnnouncements.js
│       └── common/
│           └── LoadingSpinner.js
├── public/                      # Static assets
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend integrates with the backend API endpoints:

### Admin Dashboard APIs
- `GET /api/admin-dashboard/dashboard-data` - Comprehensive dashboard data
- `GET /api/admin-dashboard/earnings` - Financial earnings data
- `GET /api/admin-dashboard/expiring-soon` - Expiring memberships
- `GET /api/admin-dashboard/membership-by-gender` - Gender distribution

### Clerk Dashboard APIs
- `GET /api/clerk-dashboard/dashboard-data` - Clerk dashboard data
- `GET /api/clerk-dashboard/earnings` - Financial data
- `GET /api/clerk-dashboard/announcements` - Read-only announcements

### Member Dashboard APIs
- `GET /api/member-dashboard/dashboard-data` - Member dashboard data
- `GET /api/member-dashboard/membership-plan` - Membership details
- `GET /api/member-dashboard/attendance` - Attendance history
- `GET /api/member-dashboard/workout-streak` - Workout streaks

## Authentication

Currently using mock authentication for development:

```javascript
// Mock token for testing
localStorage.setItem('adminToken', 'mock-jwt-token-for-testing');
```

For production, implement proper JWT authentication with your backend.

## Components

### Admin Components

#### DashboardCard
Reusable card component for displaying metrics with icons and change indicators.

```javascript
<DashboardCard
  title="Total Earnings"
  value="₱50,000"
  icon={CurrencyDollarIcon}
  color="green"
  change="+12.5%"
  changeType="positive"
/>
```

#### EarningsChart
Bar chart component for displaying monthly earnings data.

#### MembershipByGender
Pie chart and statistics for gender distribution.

#### ExpiringMemberships
List component for displaying memberships expiring soon.

#### RecentAnnouncements
Card component for displaying recent system announcements.

### Common Components

#### LoadingSpinner
Reusable loading spinner for async operations.

## Styling

The application uses Tailwind CSS for styling with a consistent design system:

- **Colors**: Blue primary, green success, red error, yellow warning
- **Spacing**: Consistent 4px grid system
- **Typography**: Inter font family
- **Shadows**: Subtle elevation system
- **Responsive**: Mobile-first design approach

## Development Guidelines

### Code Style
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Use TypeScript-like prop validation
- Follow React best practices

### Component Structure
```javascript
'use client';

import { useState, useEffect } from 'react';
import { IconName } from '@heroicons/react/24/outline';

export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Component content */}
    </div>
  );
}
```

### API Integration Pattern
```javascript
const fetchData = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch('/api/endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setData(data);
    }
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## Testing

### Manual Testing
1. Start the development server
2. Navigate to `http://localhost:3000`
3. Use the login page with mock credentials
4. Test each dashboard functionality
5. Verify responsive design on different screen sizes

### Browser Testing
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables
Set the following environment variables for production:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_NAME` - Application name

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure backend is running on port 5001
   - Check CORS configuration
   - Verify API endpoints

2. **Authentication Issues**
   - Clear localStorage and re-login
   - Check token expiration
   - Verify role permissions

3. **Styling Issues**
   - Clear browser cache
   - Restart development server
   - Check Tailwind CSS configuration

4. **Performance Issues**
   - Optimize images and assets
   - Implement proper caching
   - Use React.memo for expensive components

## Future Enhancements

### Planned Features
- Real-time updates with WebSocket
- Advanced charts and analytics
- Mobile app development
- Push notifications
- Offline functionality

### Performance Improvements
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Verify environment setup
4. Test with different browsers

---

**Version**: 1.0.0
**Last Updated**: January 2024
**Author**: Kramz Fitness Hub Development Team
