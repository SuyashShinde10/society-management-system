const express = require('express');
const router = express.Router();
const { getMeetings, createMeeting, deleteMeeting } = require('../controllers/meetingController');
const { protect, admin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createMeetingSchema } = require('../validations/schemas');

router.route('/')
  .get(protect, getMeetings)
  .post(protect, admin, validateRequest(createMeetingSchema), createMeeting);

router.route('/:id')
  .delete(protect, admin, deleteMeeting);

module.exports = router;
