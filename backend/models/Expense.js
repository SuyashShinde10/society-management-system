const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  
  // --- NEW FIELD: Link to Society ---
  society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);