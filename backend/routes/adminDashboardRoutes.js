const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const { authenticate } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get total earnings
router.get('/earnings', adminDashboardController.getTotalEarnings);

// Get total members with membership
router.get('/members-with-membership', adminDashboardController.getTotalMembersWithMembership);

// Get total member accounts
router.get('/member-accounts', adminDashboardController.getTotalMemberAccounts);

// Get total staff
router.get('/staff', adminDashboardController.getTotalStaff);

// Get total equipment
router.get('/equipment', adminDashboardController.getTotalEquipment);

// Get expiring soon memberships
router.get('/expiring-soon', adminDashboardController.getExpiringSoon);

// Get expired members
router.get('/expired-members', adminDashboardController.getExpiredMembers);

// Get earnings and expenses report
router.get('/earnings-expenses-report', adminDashboardController.getEarningsAndExpensesReport);

// Get membership by gender
router.get('/membership-by-gender', adminDashboardController.getMembershipByGender);

// Get announcements
router.get('/announcements', adminDashboardController.getAnnouncements);

// Get comprehensive dashboard data
router.get('/dashboard-data', adminDashboardController.getDashboardData);

module.exports = router; 