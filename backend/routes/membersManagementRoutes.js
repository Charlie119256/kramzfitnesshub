const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const membersController = require('../controllers/membersController');

// Get all members with active membership plans
router.get('/', authenticate, membersController.getAllMembers);

// Get members statistics
router.get('/statistics', authenticate, membersController.getMembersStatistics);

// Get member details
router.get('/:member_membership_id', authenticate, membersController.getMemberDetails);

// Add compensation for a member
router.post('/:member_membership_id/compensation', authenticate, membersController.addCompensation);

// Extend membership for a member
router.put('/:member_membership_id/extend', authenticate, membersController.extendMembership);

// Get compensation history for a member
router.get('/:member_membership_id/compensation-history', authenticate, membersController.getCompensationHistory);

// Bulk add compensation for multiple members
router.post('/bulk-compensation', authenticate, membersController.bulkAddCompensation);

module.exports = router; 