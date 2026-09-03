const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAnalytics, getPredictiveMaintenance, getSentimentAnalysis } = require('../controllers/analyticsController');

router.get('/', protect, getAnalytics);
router.get('/predictive-maintenance', protect, getPredictiveMaintenance);
router.get('/sentiment', protect, getSentimentAnalysis);

module.exports = router;
