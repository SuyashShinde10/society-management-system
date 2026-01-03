const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  
  // --- NEW FIELD: LINK TO SOCIETY ---
  society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },

  // Flat Details
  flatDetails: {
    wing: { type: String },
    floor: { type: Number },
    flatNumber: { type: String },
    isOwner: { type: Boolean, default: true } // Owner vs Tenant
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);