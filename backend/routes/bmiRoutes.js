const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const bmiController = require('../controllers/bmiController');

// Add BMI record
router.post('/', authenticate, bmiController.addBmiRecord);
// List BMI records
router.get('/', authenticate, bmiController.getMyBmiRecords);

module.exports = router; 