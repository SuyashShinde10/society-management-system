const Expense = require('../models/Expense');

// @desc    Get all expenses for the society
const getExpenses = async (req, res) => {
  try {
    if (!req.user.societyId) return res.json([]);
    
    const expenses = await Expense.find({ societyId: req.user.societyId })
                                  .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new expense
const addExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    if (!req.user.societyId) {
      return res.status(400).json({ message: "Error: Your account is not linked to a Society." });
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Optional: Check if user is authorized (Admin only)
    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- EXPORT ALL FUNCTIONS ---
module.exports = {
  getExpenses,
  addExpense,
  deleteExpense // <--- This was missing
};