const express = require('express');
const router = express.Router();
const memberDashboardController = require('../controllers/memberDashboardController');
const { authenticate } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get member profile data for navbar
router.get('/profile', memberDashboardController.getMemberProfile);

// Get detailed member profile for profile page
router.get('/detailed-profile', memberDashboardController.getDetailedMemberProfile);

// Get member's current membership plan
router.get('/membership-plan', memberDashboardController.getMembershipPlan);

// Get remaining days of membership plan
router.get('/remaining-days', memberDashboardController.getRemainingDays);

// Get total days of working out based on attendance
router.get('/workout-days', memberDashboardController.getTotalWorkoutDays);

// Get attendance with date filtering
router.get('/attendance', memberDashboardController.getAttendanceWithFilter);

// Get announcements for members
router.get('/announcements', memberDashboardController.getAnnouncements);

// Get comprehensive dashboard data
router.get('/dashboard-data', memberDashboardController.getDashboardData);

// Get member's workout streak
router.get('/workout-streak', memberDashboardController.getWorkoutStreak);

module.exports = router; 