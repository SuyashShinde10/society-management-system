const express = require('express');
const router = express.Router();
const {
  getComplaints,
  addComplaint,
  updateComplaintStatus,
  deleteComplaint
} = require('../controllers/complaintController');

const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const { createComplaintSchema, updateComplaintSchema } = require('../validations/schemas');

// Any logged-in user with 'read:complaints' can list complaints (service filters by role)
router.get('/', protect, hasPermission('read:complaints'), getComplaints);

// Members can create complaints
router.post('/', protect, hasPermission('create:complaints'), validateRequest(createComplaintSchema), addComplaint);

// ✅ SECURITY: Status updates must be admin-only ('manage:complaints').
// The frontend hides this for members but the API must enforce it too.
router.put('/status/:id', protect, hasPermission('manage:complaints'), validateRequest(updateComplaintSchema), updateComplaintStatus);

// Delete — admin only
router.delete('/:id', protect, hasPermission('manage:complaints'), deleteComplaint);

module.exports = router;