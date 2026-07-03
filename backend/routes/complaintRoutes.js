const express = require('express');
const router = express.Router();
const {
  getComplaints,
  addComplaint,
  updateComplaintStatus,
  deleteComplaint
} = require('../controllers/complaintController');

const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getComplaints);
router.post('/', protect, addComplaint);

// ✅ SECURITY FIX (H5): Status updates must be admin-only.
// The frontend hides this for members but the API must enforce it too.
router.put('/status/:id', protect, admin, updateComplaintStatus);

router.delete('/:id', protect, deleteComplaint);

module.exports = router;