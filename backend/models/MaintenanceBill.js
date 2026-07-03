const mongoose = require('mongoose');

const MaintenanceBillSchema = new mongoose.Schema({
  societyId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },

  title: { type: String, required: true },
  description: { type: String },

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

module.exports = mongoose.model('MaintenanceBill', MaintenanceBillSchema);
