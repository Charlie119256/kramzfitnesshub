const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const receiptController = require('../controllers/receiptController');

// Create receipt (admin/clerk)
router.post('/', authenticate, receiptController.createReceipt);
// List all receipts (admin/clerk)
router.get('/', authenticate, receiptController.listReceipts);
// Member's receipts
router.get('/my', authenticate, receiptController.getMyReceipts);

module.exports = router; 