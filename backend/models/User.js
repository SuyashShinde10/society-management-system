const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  
  // Link every user to a specific Society
  societyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Society', 
    required: true 
  },

  flatDetails: {
    wing: { type: String },
    floor: { type: String },
    flatNumber: { type: String },
    residentType: { type: String, enum: ['Owner', 'Tenant'], default: 'Owner' } // <--- Added This
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);