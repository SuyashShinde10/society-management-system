const Meeting = require('../models/Meeting');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { getProfessionalEmailTemplate } = require('../utils/emailTemplates');

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

    // Notify members
    const meetingDate = new Date(date).toLocaleString();
    
    if (targetType === 'Specific') {
      const user = await User.findOne({ _id: targetUserId, societyId: req.user.societyId });
      if (!user) return res.status(404).json({ message: 'MEMBER_NOT_FOUND_IN_SOCIETY' });

      const html = getProfessionalEmailTemplate({
        subtitle: 'MEETING INVITATION',
        greeting: `Hello ${user.name},`,
        bodyText: `You have been invited to a society meeting: "<strong>${title}</strong>".`,
        highlightBox: meetingDate,
        highlightBoxLabel: `Location: ${location}`,
        footerText: 'Please try to attend.'
      });

      sendEmail({
        email: user.email,
        subject: `Meeting Invite: ${title}`,
        message: `Hello ${user.name},\n\nYou have been invited to a society meeting.\n\nTitle: ${title}\nDate: ${meetingDate}\nLocation: ${location}\nDescription: ${description}\n\nPlease try to attend.`,
        html
      });
    } else {
      const members = await User.find({ societyId: req.user.societyId, role: 'member', isActive: true });
      
      const html = getProfessionalEmailTemplate({
        subtitle: 'SOCIETY MEETING',
        greeting: 'Hello Resident,',
        bodyText: `A new society meeting has been scheduled: "<strong>${title}</strong>".`,
        highlightBox: meetingDate,
        highlightBoxLabel: `Location: ${location}`,
        footerText: 'Your attendance is highly appreciated.'
      });

      (async () => {
        for (const member of members) {
          await sendEmail({
            email: member.email,
            subject: `Society Meeting: ${title}`,
            message: `Hello ${member.name},\n\nA new society meeting has been scheduled.\n\nTitle: ${title}\nDate: ${meetingDate}\nLocation: ${location}\nDescription: ${description}\n\nPlease try to attend.`,
            html
          }).catch(err => console.error("Meeting email error:", err.message));
          await new Promise(r => setTimeout(r, 100)); // 100ms delay
        }
      })();
    }

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
