const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  // Ensure this matches 'societyName' from your frontend payload in the controller
  name: { type: String, required: true }, 
  address: { type: String, required: true },
  regNumber: { type: String, required: true }, 
  
  wings: [{ type: String }], 
  floors: { type: Number, required: true },
  flatsPerFloor: { type: Number, required: true },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
 
module.exports = mongoose.model('Society', societySchema);