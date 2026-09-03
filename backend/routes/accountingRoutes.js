const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  exportTally,
  exportCSV,
  getTaxSummary,
  createSinkingFund,
  getSinkingFunds
} = require('../controllers/accountingController');

// Exports
router.get('/export/tally', protect, exportTally);
router.get('/export/csv', protect, exportCSV);
router.get('/tax-summary', protect, getTaxSummary);

// Sinking Funds
router.get('/sinking-funds', protect, getSinkingFunds);
router.post('/sinking-funds', protect, createSinkingFund);

module.exports = router;
