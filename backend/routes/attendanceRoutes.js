const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const attendanceController = require('../controllers/attendanceController');

// Check-in
router.post('/check-in', authenticate, attendanceController.checkIn);
// Check-out
router.post('/check-out', authenticate, attendanceController.checkOut);
// Combined scan (check-in/check-out with interval)
router.post('/scan', authenticate, attendanceController.scan);
// List attendance
router.get('/', authenticate, attendanceController.getMyAttendance);
// Attendance log for today (admin/clerk)
router.get('/today-log', authenticate, attendanceController.getTodayAttendance);

module.exports = router; 