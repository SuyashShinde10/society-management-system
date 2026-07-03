const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  name: {
    type: String, required: true, trim: true, maxlength: [200, 'Society name too long']
  },
  address: {
    type: String, required: true, trim: true, maxlength: [500, 'Address too long']
  },
  regNumber: {
    type: String, required: true, unique: true, trim: true, maxlength: [50, 'Reg number too long']
  },

  wings: [{ type: String, trim: true }],
  floors: { type: Number, required: true, min: 0, max: 200 },

  // ── New fields ─────────────────────────────────────────
  city: { type: String, trim: true, maxlength: 100 },
  state: { type: String, trim: true, maxlength: 100 },
  pincode: { type: String, trim: true, maxlength: 10 },
  contactEmail: { type: String, trim: true, lowercase: true },
  contactPhone: { type: String, trim: true },
  maintenanceAmount: { type: Number, default: 0, min: 0 },
  amenities: [{ type: String, trim: true }], // ['Pool', 'Gym', 'Clubhouse']
  logo: { type: String }, // URL

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Society', societySchema);