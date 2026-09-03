const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { pollIoTData } = require('../controllers/iotController');

router.post('/poll', protect, adminOnly, pollIoTData);

module.exports = router;
