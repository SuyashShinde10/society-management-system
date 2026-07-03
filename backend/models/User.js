const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String, required: true, trim: true, maxlength: [100, 'Name too long']
  },
  email: {
    type: String, required: true, unique: true, trim: true,
    lowercase: true, maxlength: [150, 'Email too long']
  },
  password: {
    type: String, required: true, minlength: 6
  },
  role: {
    type: String, enum: ['admin', 'member'], default: 'member'
  },

  // ── New fields ─────────────────────────────────────────
  phone: { type: String, trim: true, maxlength: 15 },
  isActive: { type: Boolean, default: true },
  parkingSlot: { type: String, trim: true, maxlength: 20 },
  vehicleNumber: { type: String, trim: true, maxlength: 20 },
  profilePicture: { type: String }, // URL

  // Society link
  societyId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true
  },

  flatDetails: {
    wing: { type: String, trim: true, maxlength: 10 },
    floor: { type: String, trim: true },
    flatNumber: { type: String, trim: true, maxlength: 20 },
    residentType: {
      type: String, enum: ['Owner', 'Tenant'], default: 'Owner'
    },
    moveInDate: { type: Date },
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);