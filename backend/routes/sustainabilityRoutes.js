const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMetrics,
  updateTank,
  addTanker,
  startEV,
  stopEV,
  addSolar
} = require('../controllers/sustainabilityController');

router.get('/metrics', protect, getMetrics);
router.post('/tanks/update', protect, updateTank);
router.post('/tankers', protect, addTanker);
router.post('/ev/start', protect, startEV);
router.post('/ev/stop', protect, stopEV);
router.post('/solar', protect, addSolar);

module.exports = router;
