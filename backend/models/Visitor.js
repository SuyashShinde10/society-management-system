const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  societyId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true
  },
  hostUserId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },

  visitorName: { type: String, required: true, trim: true, maxlength: 100 },
  visitorPhone: { type: String, trim: true, maxlength: 15 },
  vehicleNumber: { type: String, trim: true, maxlength: 20 },

  purpose: {
    type: String,
    enum: ['Guest', 'Delivery', 'Service', 'Cab', 'Other'],
    default: 'Guest'
  },

  entryTime: { type: Date, default: Date.now },
  exitTime: { type: Date },

  status: {
    type: String, enum: ['Inside', 'Exited'], default: 'Inside'
  },

  notes: { type: String, trim: true, maxlength: 300 },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', VisitorSchema);
