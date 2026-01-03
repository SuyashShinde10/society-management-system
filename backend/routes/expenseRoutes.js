const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  addExpense, 
  deleteExpense // <--- Ensure this is imported
} = require('../controllers/expenseController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getExpenses);
router.post('/', protect, addExpense);

// This line was crashing because deleteExpense was undefined
router.delete('/:id', protect, deleteExpense); 

module.exports = router;