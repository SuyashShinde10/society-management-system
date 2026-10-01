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

// Admin-only expense management via 'manage:expenses' permission
router.get('/', protect, hasPermission('manage:expenses'), getExpenses);
router.post('/', protect, hasPermission('manage:expenses'), validateRequest(createExpenseSchema), addExpense);
router.delete('/:id', protect, hasPermission('manage:expenses'), deleteExpense);

module.exports = router;