const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

// List notifications
router.get('/', authenticate, notificationController.listNotifications);
// Mark notification as read
router.put('/:notification_id/read', authenticate, notificationController.markNotificationRead);

module.exports = router; 