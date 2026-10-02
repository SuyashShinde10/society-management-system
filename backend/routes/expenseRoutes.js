const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  addExpense, 
  deleteExpense,
} = require('../controllers/expenseController');

const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const { createExpenseSchema } = require('../validations/schemas');

// Expense management — read is accessible to members for transparency, manage is admin-only
router.get('/', protect, hasPermission('read:expenses'), getExpenses);
router.post('/', protect, hasPermission('manage:expenses'), validateRequest(createExpenseSchema), addExpense);
router.delete('/:id', protect, hasPermission('manage:expenses'), deleteExpense);

module.exports = router;