const express = require('express');
const router = express.Router();
const { getMeetings, createMeeting, deleteMeeting } = require('../controllers/meetingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMeetings)
  .post(protect, admin, createMeeting);

router.route('/:id')
  .delete(protect, admin, deleteMeeting);

module.exports = router;
