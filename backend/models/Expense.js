const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true, maxlength: [200, 'Title too long']
  },
  amount: {
    type: Number, required: true, min: [0.01, 'Amount must be > 0'], max: [10000000, 'Amount too large']
  },
  category: {
    type: String, required: true, trim: true,
    enum: ['Maintenance', 'Repairs', 'Salary', 'Event', 'Utilities', 'Security', 'Other'],
    default: 'Other'
  },

  // ── New fields ─────────────────────────────────────────
  paymentMode: {
    type: String, enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Other'], default: 'Cash'
  },
  expenseDate: { type: Date, default: Date.now },
  receipt: { type: String }, // URL to uploaded receipt image
  notes: { type: String, trim: true, maxlength: [500, 'Notes too long'] },

  societyId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);