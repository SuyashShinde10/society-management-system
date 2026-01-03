const express = require('express');
const router = express.Router();
const { 
  getComplaints, 
  addComplaint, 
  updateComplaintStatus, 
  deleteComplaint // <--- Ensure this is imported
} = require('../controllers/complaintController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getComplaints);
router.post('/', protect, addComplaint);
router.put('/status/:id', protect, updateComplaintStatus);

// This is the line that was crashing because deleteComplaint was undefined
router.delete('/:id', protect, deleteComplaint); 

module.exports = router;