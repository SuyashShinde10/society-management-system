const Expense = require('../models/Expense');

// @desc    Get all expenses for the society
const getExpenses = async (req, res) => {
  try {
    if (!req.user.societyId) return res.json([]);

    const expenses = await Expense.find({ societyId: req.user.societyId })
      .sort({ createdAt: -1 })
      .limit(200); // Safety cap

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc    Add a new expense (Admin only)
const addExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ message: 'TITLE_AMOUNT_CATEGORY_REQUIRED' });
    }

    if (!req.user.societyId) {
      return res.status(400).json({ message: 'ACCOUNT_NOT_LINKED_TO_SOCIETY' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'AMOUNT_MUST_BE_POSITIVE' });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      societyId: req.user.societyId,
      recordedBy: req.user._id
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc    Delete an expense (Admin only)
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'EXPENSE_NOT_FOUND' });
    }

    // Ensure expense belongs to admin's own society
    if (expense.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    await expense.deleteOne();
    res.json({ message: 'EXPENSE_REMOVED' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = { getExpenses, addExpense, deleteExpense };