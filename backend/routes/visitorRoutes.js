const express = require('express');
const router = express.Router();
const {
  checkInVisitor,
  checkOutVisitor,
  getSocietyVisitors,
  getMyVisitors
} = require('../controllers/visitorController');
const { protect, admin, securityGuard } = require('../middleware/authMiddleware');

// Security Guard routes
router.post('/check-in', protect, securityGuard, checkInVisitor);
router.put('/check-out/:id', protect, securityGuard, checkOutVisitor);
router.get('/today', protect, securityGuard, getSocietyVisitors);

// Admin routes
router.get('/all', protect, admin, getSocietyVisitors);

// Member routes (can see visitors to their flat)
router.get('/my-visitors', protect, getMyVisitors);

module.exports = router;
