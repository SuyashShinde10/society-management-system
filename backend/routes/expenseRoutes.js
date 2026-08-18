const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  addExpense, 
  deleteExpense // <--- Ensure this is imported
} = require('../controllers/expenseController');

const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getExpenses);
router.post('/', protect, admin, addExpense);

// This line was crashing because deleteExpense was undefined
router.delete('/:id', protect, admin, deleteExpense); 

module.exports = router;