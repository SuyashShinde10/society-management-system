const Expense = require('../models/Expense');

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ society: req.user.society }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    // SAFETY CHECK
    if (!req.user.society) {
      return res.status(400).json({ message: "Error: User not linked to society." });
    }
    
    await Expense.create({
      title,
      amount,
      category,
      society: req.user.society
    });

    res.status(201).json({ message: "Expense added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpenses, addExpense, deleteExpense };