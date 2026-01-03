const Complaint = require('../models/Complaint');

// @desc    Get all complaints for the user's society
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    // Check if user is linked to a society
    if (!req.user.societyId) {
      return res.status(400).json({ message: "User is not linked to any society." });
    }

    // Fetch complaints ONLY for this society
    const complaints = await Complaint.find({ societyId: req.user.societyId })
      .populate('user', 'name flatDetails')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
const addComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      societyId: req.user.societyId, // Attach society ID
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
// @route   PUT /api/complaints/status/:id
// @access  Private (Admin)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Optional: Security check to ensure admin owns this society
    if (req.user.societyId && complaint.societyId.toString() !== req.user.societyId.toString()) {
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

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin/Owner)
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user is authorized (Admin or the person who posted it)
    if (req.user.role !== 'admin' && complaint.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this' });
    }

    await complaint.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- EXPORTS ---
module.exports = {
  getComplaints,
  addComplaint,
  updateComplaintStatus,
  deleteComplaint, // <--- This was missing and caused the crash
};