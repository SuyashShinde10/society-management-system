const mongoose = require('mongoose');

const MaintenanceBillSchema = new mongoose.Schema({
  societyId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },

  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },

  amount: { type: Number, required: true, min: 0 },
  isPaid: { type: Boolean, default: false },
  paidOn: { type: Date },
  paymentMode: {
    type: String, enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Other']
  },

  dueDate: { type: Date },
  lateFee: { type: Number, default: 0 },
  notes: { type: String, trim: true, maxlength: 300 },

  // Who marked it as paid
  markedPaidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Prevent duplicate bills for same user/month/year
MaintenanceBillSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MaintenanceBill', MaintenanceBillSchema);
