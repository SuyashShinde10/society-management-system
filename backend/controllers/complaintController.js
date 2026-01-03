const Complaint = require('../models/Complaint');

// @desc    Get all complaints for the user's society
const getComplaints = async (req, res) => {
  try {
    if (!req.user.societyId) {
      return res.status(400).json({ message: "User is not linked to any society." });
    }

    const complaints = await Complaint.find({ societyId: req.user.societyId })
      .populate('user', 'name flatDetails') // <--- CRITICAL: Fetches Name & Flat
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new complaint
const addComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please add all fields' });
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
    console.error("Error creating complaint:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update complaint status
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check if user has a societyId (prevents crash for old admins)
    if (req.user.societyId && complaint.societyId && complaint.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role !== 'admin' && complaint.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await complaint.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getComplaints,
  addComplaint,
  updateComplaintStatus,
  deleteComplaint,
};