const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const membershipTypeController = require('../controllers/membershipTypeController');

// List all membership types
router.get('/', authenticate, membershipTypeController.listMembershipTypes);
// Create a new membership type (admin only)
router.post('/', authenticate, membershipTypeController.createMembershipType);
// Update a membership type (admin only)
router.put('/:membership_id', authenticate, membershipTypeController.updateMembershipType);
// Delete a membership type (admin only)
router.delete('/:membership_id', authenticate, membershipTypeController.deleteMembershipType);

module.exports = router; 