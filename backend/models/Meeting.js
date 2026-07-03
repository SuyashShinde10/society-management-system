const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Meeting description is required'],
  },
  date: {
    type: Date,
    required: [true, 'Meeting date is required'],
  },
  location: {
    type: String,
    required: [true, 'Location or Link is required'],
  },
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetType: { type: String, enum: ['All', 'Specific'], default: 'All' },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);
