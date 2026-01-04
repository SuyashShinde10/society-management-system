const Complaint = require('../models/Complaint');

const getComplaints = async (req, res) => {
  try {
    if (!req.user || !req.user.societyId) {
      return res.status(200).json([]); // Return empty list instead of crashing
    }

    const complaints = await Complaint.find({ societyId: req.user.societyId })
      .populate('user', 'name flatDetails')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

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

const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    // Authorization Check
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

module.exports = { getComplaints, addComplaint, updateComplaintStatus, deleteComplaint };