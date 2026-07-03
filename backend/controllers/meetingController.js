const Meeting = require('../models/Meeting');

// @desc    Get all meetings for a society
// @route   GET /api/meetings
// @access  Private (Admin & Member)
exports.getMeetings = async (req, res) => {
  try {
    const filter = { societyId: req.user.societyId };
    if (req.user.role === 'member') {
      filter.$or = [
        { targetType: 'All' },
        { targetType: 'Specific', targetUserId: req.user._id }
      ];
    }

    const meetings = await Meeting.find(filter)
      .sort({ date: -1 })
      .populate('createdBy', 'name');
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching meetings', error: error.message });
  }
};

// @desc    Create a new meeting
// @route   POST /api/meetings
// @access  Private (Admin)
exports.createMeeting = async (req, res) => {
  try {
    const { title, description, date, location, targetType, targetUserId } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const meeting = await Meeting.create({
      title,
      description,
      date,
      location,
      societyId: req.user.societyId,
      createdBy: req.user._id,
      targetType: targetType || 'All',
      targetUserId: targetType === 'Specific' ? targetUserId : undefined,
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating meeting', error: error.message });
  }
};

// @desc    Delete a meeting
// @route   DELETE /api/meetings/:id
// @access  Private (Admin)
exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    if (meeting.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this meeting' });
    }

    await meeting.deleteOne();
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting meeting', error: error.message });
  }
};
