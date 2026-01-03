const express = require('express');
const router = express.Router();
const { 
  getComplaints, 
  addComplaint, 
  updateComplaintStatus, // Check this name!
  voteComplaint, 
  deleteComplaint 
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');

// Check line 6 - ensure getComplaints is not undefined
router.get('/', protect, getComplaints);
router.post('/', protect, addComplaint);

// Update status (Admin only)
router.put('/status/:id', protect, admin, updateComplaintStatus);

 

router.delete('/:id', protect, admin, deleteComplaint);

module.exports = router;