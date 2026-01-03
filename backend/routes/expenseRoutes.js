const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, admin } = require('../middleware/authMiddleware');

// 1. GET Expenses -> Visible to ALL logged-in users (Removed 'admin')
router.get('/', protect, getExpenses);

// 2. ADD/DELETE Expenses -> Restricted to Admin ONLY
router.post('/', protect, admin, addExpense);
router.delete('/:id', protect, admin, deleteExpense);

module.exports = router;