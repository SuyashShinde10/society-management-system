const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0'],
    max: [10000000, 'Amount exceeds allowed maximum']
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Maintenance', 'Repairs', 'Salary', 'Event', 'Other'],
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);