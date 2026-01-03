const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Add this field to filter by society
  societyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Society', 
    required: true 
  },
  
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Resolved', 'Declined'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);