const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  addExpense, 
  deleteExpense // <--- Ensure this is imported
} = require('../controllers/expenseController');

const { protect, admin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createExpenseSchema } = require('../validations/schemas');

router.get('/', protect, getExpenses);
router.post('/', protect, admin, validateRequest(createExpenseSchema), addExpense);

// This line was crashing because deleteExpense was undefined
router.delete('/:id', protect, admin, deleteExpense); 

module.exports = router;