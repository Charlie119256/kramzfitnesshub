const express = require('express');
const router = express.Router();
const clerkController = require('../controllers/clerkController');
const { authenticate, isAdmin } = require('../middlewares/auth');

router.post('/', authenticate, isAdmin, clerkController.createClerk);
router.get('/', authenticate, isAdmin, clerkController.getClerks);
router.put('/:clerk_id', authenticate, isAdmin, clerkController.updateClerk);
router.put('/profile/:clerk_id', authenticate, clerkController.editClerkProfile);
router.delete('/:clerk_id', authenticate, isAdmin, clerkController.deactivateClerk);

module.exports = router; 