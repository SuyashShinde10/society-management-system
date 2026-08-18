const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true, maxlength: 15 },
  purpose: { type: String, required: true },
  wing: { type: String, trim: true },
  flatNumber: { type: String, trim: true },
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Inside', 'CheckedOut'], default: 'Inside' },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  photo: { type: String }, // Base64 string of the visitor's photo
  signature: { type: String } // Base64 string of the visitor's signature
}, { timestamps: true });

module.exports = mongoose.model('Visitor', VisitorSchema);
