const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending or Resolved
  votes: { type: Number, default: 0 },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Track who voted
}, {
  timestamps: true // <--- THIS IS CRITICAL for showing Dates
});

module.exports = mongoose.model('Complaint', complaintSchema);