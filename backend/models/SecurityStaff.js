const mongoose = require('mongoose');

const SecurityStaffSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'security' },
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  phone: { type: String, trim: true },
  age: { type: Number },
  address: { type: String, trim: true },
  shift: { type: String, enum: ['Day', 'Night', 'Rotational'], default: 'Day' },
  status: { type: String, enum: ['Active', 'Left'], default: 'Active' },
  joinDate: { type: Date, default: Date.now },
  leaveDate: { type: Date },
  mustChangePassword: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SecurityStaff', SecurityStaffSchema);
