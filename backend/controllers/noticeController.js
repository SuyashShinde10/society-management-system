const Notice = require('../models/Notice');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { getProfessionalEmailTemplate } = require('../utils/emailTemplates');

const getNotices = async (req, res) => {
  try {
    if (!req.user.societyId) return res.json([]);

    const filter = { societyId: req.user.societyId };
    if (req.user.role === 'member') {
      filter.$or = [
        { targetType: 'All' },
        { targetType: 'Specific', targetUserId: req.user._id }
      ];
    }

    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 })
      .limit(100); // Safety cap

    res.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const addNotice = async (req, res) => {
  try {
    const { title, content, targetType, targetUserId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'TITLE_AND_CONTENT_REQUIRED' });
    }

    if (!req.user.societyId) {
      return res.status(400).json({ message: 'ACCOUNT_NOT_LINKED_TO_SOCIETY' });
    }

    const notice = await Notice.create({
      title,
      content,
      societyId: req.user.societyId,
      createdBy: req.user._id,
      targetType: targetType || 'All',
      targetUserId: targetType === 'Specific' ? targetUserId : undefined,
    });

    // Notify members
    if (targetType === 'Specific') {
      const user = await User.findOne({ _id: targetUserId, societyId: req.user.societyId });
      if (!user) return res.status(404).json({ message: 'MEMBER_NOT_FOUND_IN_SOCIETY' });

      const html = getProfessionalEmailTemplate({
        subtitle: 'DIRECT NOTICE',
        greeting: `Hello ${user.name},`,
        bodyText: `A new notice has been posted specifically for you.`,
        highlightBox: title,
        highlightBoxLabel: 'Notice Title',
        footerText: 'Please log in to the portal to view full details.'
      });

      sendEmail({
        email: user.email,
        subject: `New Notice: ${title}`,
        message: `Hello ${user.name},\n\nA new notice has been posted specifically for you:\n\nTitle: ${title}\n\n${content}\n\nPlease check the portal for more details.`,
        html
      });
    } else {
      const members = await User.find({ societyId: req.user.societyId, role: 'member', isActive: true });
      
      const html = getProfessionalEmailTemplate({
        subtitle: 'SOCIETY NOTICE',
        greeting: 'Hello Resident,',
        bodyText: `A new society notice has been posted by the administration.`,
        highlightBox: title,
        highlightBoxLabel: 'Notice Title',
        footerText: 'Please log in to the portal to view full details.'
      });
      // In a real production system, this should be sent as BCC or handled via a queue to avoid spam/timeouts.
      (async () => {
        for (const member of members) {
          await sendEmail({
            email: member.email,
            subject: `Society Notice: ${title}`,
            message: `Hello ${member.name},\n\nA new society notice has been posted:\n\nTitle: ${title}\n\n${content}\n\nPlease check the portal for more details.`,
            html
          }).catch(err => console.error("Notice email error:", err.message));
          await new Promise(r => setTimeout(r, 100)); // 100ms delay between sends
        }
      })();
    }

    res.status(201).json(notice);
  } catch (error) {
    console.error('Add Notice Error:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'NOTICE_NOT_FOUND' });

    // Ensure notice belongs to admin's society
    if (notice.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    await notice.deleteOne();
    
    res.json({ message: 'NOTICE_REMOVED' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = { getNotices, addNotice, deleteNotice };