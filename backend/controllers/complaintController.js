const Complaint = require('../models/Complaint');

// @desc Get all complaints
const getComplaints = async (req, res) => {
  const complaints = await Complaint.find().sort({ createdAt: -1 });
  res.json(complaints);
};

// @desc Create a complaint
const addComplaint = async (req, res) => {
  const { title, description } = req.body;
  const complaint = await Complaint.create({
    user: req.user._id,
    title,
    description
  });
  res.status(201).json(complaint);
};

// @desc Update status to Resolved or Declined
const updateComplaintStatus = async (req, res) => {
  const { status } = req.body; 
  const complaint = await Complaint.findById(req.params.id);

  if (complaint) {
    complaint.status = status;
    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } else {
    res.status(404).json({ message: 'Complaint not found' });
  }
};

// @desc Upvote Complaint
const voteComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (complaint) {
    if (complaint.votedBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'You already voted' });
    }
    complaint.votes += 1;
    complaint.votedBy.push(req.user._id);
    await complaint.save();
    res.json(complaint);
  } else {
    res.status(404).json({ message: 'Complaint not found' });
  }
};

const deleteComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (complaint) {
    await complaint.deleteOne();
    res.json({ message: 'Complaint removed' });
  } else {
    res.status(404).json({ message: 'Complaint not found' });
  }
};

// MAKE SURE ALL THESE ARE IN THE EXPORTS
module.exports = { 
  getComplaints, 
  addComplaint, 
  updateComplaintStatus, 
  voteComplaint, 
  deleteComplaint 
};