const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const expensesController = require('../controllers/expensesController');

// Get all expenses with filtering
router.get('/', authenticate, expensesController.getAllExpenses);

// Get expenses analytics
router.get('/analytics', authenticate, expensesController.getExpensesAnalytics);

// Get expense details by ID
router.get('/:equipment_id', authenticate, expensesController.getExpenseDetails);

// Get expense trends
router.get('/trends/analysis', authenticate, expensesController.getExpenseTrends);

// Get expense forecast
router.get('/forecast/prediction', authenticate, expensesController.getExpenseForecast);

module.exports = router; 