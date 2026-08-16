const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
  societyId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true
  },
  title: {
    type: String, required: true, trim: true, maxlength: [200, 'Title too long']
  },
  description: {
    type: String, required: true, trim: true, maxlength: [2000, 'Description too long']
  },
  status: {
    type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Declined'], default: 'Pending'
  },

  // ── New fields ─────────────────────────────────────────
  priority: {
    type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Low'
  },
  attachment: {
    type: String,
    maxlength: [500, 'Attachment URL too long'], // URLs only — no base64
  },
  category: {
    type: String,
    enum: ['Water', 'Electricity', 'Lift', 'Security', 'Cleanliness', 'Noise', 'Parking', 'Other'],
    default: 'Other'
  },
  adminComment: { type: String, trim: true, maxlength: [500, 'Comment too long'] },
  resolvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);