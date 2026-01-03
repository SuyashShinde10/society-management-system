const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  regNumber: { type: String, required: true }, // Registration Number
  
  // Structure Details
  wings: [{ type: String }], // e.g., ["A", "B", "C"]
  floors: { type: Number, required: true },
  flatsPerFloor: { type: Number, required: true },
  
  // Who created this society? (The Super Admin for this building)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Society', societySchema);