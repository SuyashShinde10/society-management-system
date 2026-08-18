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
    type: String, required: true, minlength: 8
  },
  role: {
    type: String, enum: ['admin', 'member', 'superadmin', 'security'], default: 'member'
  },

  // ── New fields ─────────────────────────────────────────
  phone: { type: String, trim: true, maxlength: 15 },
  isActive: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: false },
  parkingSlot: { type: String, trim: true, maxlength: 20 },
  vehicleNumber: { type: String, trim: true, maxlength: 20 },
  profilePicture: { type: String }, // URL

  // Society link
  societyId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Society'
  },

  flatDetails: {
    wing: { type: String, trim: true, maxlength: 10 },
    floor: { type: String, trim: true },
    flatNumber: { type: String, trim: true, maxlength: 20 },
    residentType: {
      type: String, enum: ['Owner', 'Tenant', 'Staff'], default: 'Owner'
    },
    moveInDate: { type: Date },
  },

  // Security Guard specific details
  securityDetails: {
    age: { type: Number },
    address: { type: String, trim: true },
    joinDate: { type: Date },
    leaveDate: { type: Date },
    status: { type: String, enum: ['Active', 'Left'], default: 'Active' },
    shift: { type: String, enum: ['Day', 'Night', 'Rotational'], default: 'Day' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);