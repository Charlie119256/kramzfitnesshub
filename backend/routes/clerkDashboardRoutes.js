const express = require('express');
const router = express.Router();
const clerkDashboardController = require('../controllers/clerkDashboardController');
const { authenticate } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get total earnings
router.get('/earnings', clerkDashboardController.getTotalEarnings);

// Get total members with membership
router.get('/members-with-membership', clerkDashboardController.getTotalMembersWithMembership);

// Get total member accounts
router.get('/member-accounts', clerkDashboardController.getTotalMemberAccounts);

// Get total staff
router.get('/staff', clerkDashboardController.getTotalStaff);

// Get total equipment
router.get('/equipment', clerkDashboardController.getTotalEquipment);

// Get expiring soon memberships
router.get('/expiring-soon', clerkDashboardController.getExpiringSoon);

// Get expired members
router.get('/expired-members', clerkDashboardController.getExpiredMembers);

// Get earnings and expenses report
router.get('/earnings-expenses-report', clerkDashboardController.getEarningsAndExpensesReport);

// Get membership by gender
router.get('/membership-by-gender', clerkDashboardController.getMembershipByGender);

// Get announcements (read-only for clerks)
router.get('/announcements', clerkDashboardController.getAnnouncements);

// Get comprehensive dashboard data
router.get('/dashboard-data', clerkDashboardController.getDashboardData);

module.exports = router; 