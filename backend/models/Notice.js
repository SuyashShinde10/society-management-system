const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true, maxlength: [200, 'Title too long']
  },
  content: {
    type: String, required: true, trim: true, maxlength: [5000, 'Content too long']
  },
  societyId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },

  // ── New fields ─────────────────────────────────────────
  priority: {
    type: String, enum: ['Normal', 'Important', 'Urgent'], default: 'Normal'
  },
  isPinned: { type: Boolean, default: false },
  expiryDate: { type: Date }, // Auto-hide after this date
  targetWing: { type: String, default: 'All' }, // 'All', 'A', 'B', etc.
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema);