const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  emailAttempted: { type: String },
  reason: { type: String }, 
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SecurityAlert', alertSchema);
