const express = require('express');
const router = express.Router();
const {
  getComplaints,
  addComplaint,
  updateComplaintStatus,
  deleteComplaint
} = require('../controllers/complaintController');

const { protect, admin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createComplaintSchema, updateComplaintSchema } = require('../validations/schemas');

router.get('/', protect, getComplaints);
router.post('/', protect, validateRequest(createComplaintSchema), addComplaint);

// ✅ SECURITY FIX (H5): Status updates must be admin-only.
// The frontend hides this for members but the API must enforce it too.
router.put('/status/:id', protect, admin, validateRequest(updateComplaintSchema), updateComplaintStatus);

router.delete('/:id', protect, deleteComplaint);

module.exports = router;