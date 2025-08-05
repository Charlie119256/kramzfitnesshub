const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const planApplicationController = require('../controllers/planApplicationController');

// Member applies for a plan
router.post('/', authenticate, planApplicationController.applyForPlan);
// List plan applications (clerk/admin)
router.get('/', authenticate, planApplicationController.listPlanApplications);
// Accept application (clerk/admin)
router.put('/:application_id/accept', authenticate, planApplicationController.acceptPlanApplication);
// Decline application (clerk/admin)
router.put('/:application_id/decline', authenticate, planApplicationController.declinePlanApplication);

module.exports = router; 