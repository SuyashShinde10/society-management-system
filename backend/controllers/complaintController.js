const Complaint = require('../models/Complaint');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { getProfessionalEmailTemplate } = require('../utils/emailTemplates');

const getComplaints = async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) {
      return res.status(200).json([]);
    }

    const filter = { societyId: req.user.societyId };
    if (req.user.role !== 'admin') {
      filter.user = req.user._id;
    }

    const complaints = await Complaint.find(filter)
      .populate('user', 'name flatDetails')
      .sort({ createdAt: -1 })
      .limit(100); // Safety pagination cap

    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const addComplaint = async (req, res) => {
  try {
    const { title, description, attachment } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'TITLE_AND_DESCRIPTION_REQUIRED' });
    }

    // Basic attachment validation to prevent SSRF or malformed URLs
    if (attachment) {
      try {
        new URL(attachment);
      } catch (e) {
        return res.status(400).json({ message: 'INVALID_ATTACHMENT_URL' });
      }
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      societyId: req.user.societyId,
      title,
      description,
      attachment,
      status: 'Pending',
    });

    // Notify Admins
    const admins = await User.find({ societyId: req.user.societyId, role: 'admin' });
    
    const html = getProfessionalEmailTemplate({
      subtitle: 'NEW COMPLAINT LOGGED',
      greeting: 'Hello Admin,',
      bodyText: `A new complaint has been filed by a resident in the system.`,
      highlightBox: title,
      highlightBoxLabel: 'Complaint Title',
      footerText: 'Please review and assign a resolution status in the admin dashboard.'
    });

    admins.forEach(admin => {
      sendEmail({
        email: admin.email,
        subject: `New Complaint Logged: ${title}`,
        message: `A new complaint has been filed by a resident.\n\nTitle: ${title}\nDescription: ${description}\n\nPlease review it in the admin dashboard.`,
        html
      });
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate allowed statuses
    const ALLOWED = ['Pending', 'Resolved', 'Declined'];
    if (!status || !ALLOWED.includes(status)) {
      return res.status(400).json({ message: 'INVALID_STATUS_VALUE' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'COMPLAINT_NOT_FOUND' });

    // Verify the complaint belongs to the admin's own society
    if (complaint.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();
    
    // Notify the user about the status change
    const user = await User.findById(complaint.user);
    if (user) {
      const html = getProfessionalEmailTemplate({
        subtitle: 'COMPLAINT STATUS UPDATE',
        greeting: `Hello ${user.name},`,
        bodyText: `The status of your complaint regarding "<strong>${complaint.title}</strong>" has been updated.`,
        highlightBox: status,
        highlightBoxLabel: 'New Status',
        footerText: 'Log in to the portal for more details.'
      });

      sendEmail({
        email: user.email,
        subject: `Complaint Status Updated: ${complaint.title}`,
        message: `Hello ${user.name},\n\nThe status of your complaint regarding "${complaint.title}" has been updated to: ${status}.\n\nPlease check the portal for more details.`,
        html
      });
    }

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'COMPLAINT_NOT_FOUND' });

    if (req.user.role !== 'admin' && complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    // Extra check: complaint must belong to user's society
    if (complaint.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    await complaint.deleteOne();
    
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = { getComplaints, addComplaint, updateComplaintStatus, deleteComplaint };