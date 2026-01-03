const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, default: 'General' },
  
  // --- NEW FIELD: Link to Society ---
  society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);