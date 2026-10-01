const express = require('express');
const router = express.Router();
const { getMeetings, createMeeting, deleteMeeting } = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const { createMeetingSchema } = require('../validations/schemas');

// Any authenticated user with 'read:meetings' can view meetings
router.get('/', protect, hasPermission('read:meetings'), getMeetings);

// Admin-only create and delete via 'manage:meetings' permission
router.post('/', protect, hasPermission('manage:meetings'), validateRequest(createMeetingSchema), createMeeting);
router.delete('/:id', protect, hasPermission('manage:meetings'), deleteMeeting);

module.exports = router;
