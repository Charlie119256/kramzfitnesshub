const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const announcementController = require('../controllers/announcementController');

// Create announcement (admin/clerk)
router.post('/', authenticate, announcementController.createAnnouncement);
// List announcements (all users)
router.get('/', authenticate, announcementController.listAnnouncements);

module.exports = router; 