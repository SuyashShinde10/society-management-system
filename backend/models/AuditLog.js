const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetModel: { type: String }, 
  details: { type: Object },
  ipAddress: { type: String },
  status: { type: String, enum: ['Success', 'Failed', 'Suspicious'], default: 'Success' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditSchema);
