const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const earningsController = require('../controllers/earningsController');

// Get all earnings with filtering
router.get('/', authenticate, earningsController.getAllEarnings);

// Get earnings analytics and summary
router.get('/analytics', authenticate, earningsController.getEarningsAnalytics);

// Get earnings trends and year-over-year comparison
router.get('/trends/analysis', authenticate, earningsController.getEarningsTrends);

// Get earnings forecast based on historical data
router.get('/forecast/prediction', authenticate, earningsController.getEarningsForecast);

// Get earnings details by receipt ID
router.get('/:receipt_id', authenticate, earningsController.getEarningsDetails);

module.exports = router; 