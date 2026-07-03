const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Society name cannot exceed 200 characters']
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  regNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: [50, 'Registration number cannot exceed 50 characters']
  },

  wings: [{ type: String, trim: true }],
  floors: { type: Number, required: true, min: 0, max: 200 },
  flatsPerFloor: { type: Number, required: true, min: 1, max: 100 },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  // Note: createdAt / updatedAt handled by timestamps: true below
}, { timestamps: true });

module.exports = mongoose.model('Society', societySchema);