const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { triggerEmergency } = require('../controllers/emergencyController');

router.post('/trigger', protect, adminOnly, triggerEmergency);

module.exports = router;
