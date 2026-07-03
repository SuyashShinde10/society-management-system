const Complaint = require('../models/Complaint');

const getComplaints = async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) {
      return res.status(200).json([]);
    }

    const complaints = await Complaint.find({ societyId: req.user.societyId })
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
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'TITLE_AND_DESCRIPTION_REQUIRED' });
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      societyId: req.user.societyId,
      title,
      description,
      status: 'Pending',
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