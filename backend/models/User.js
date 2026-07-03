const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [150, 'Email cannot exceed 150 characters']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },

  // Link every user to a specific Society
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },

  flatDetails: {
    wing: { type: String, trim: true, maxlength: 10 },
    floor: { type: String, trim: true },
    flatNumber: { type: String, trim: true, maxlength: 20 },
    residentType: {
      type: String,
      enum: ['Owner', 'Tenant'],
      default: 'Owner'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);