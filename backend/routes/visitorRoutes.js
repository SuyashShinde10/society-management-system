const express = require('express');
const router = express.Router();
const {
  checkInVisitor,
  checkOutVisitor,
  getSocietyVisitors,
  getMyVisitors
} = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const { createVisitorSchema, updateVisitorSchema } = require('../validations/schemas');

// Security guard + admin can check in/out and view today's visitors ('create:visitors' / 'manage:visitors')
router.post('/check-in', protect, hasPermission('create:visitors'), validateRequest(createVisitorSchema), checkInVisitor);
router.put('/check-out/:id', protect, hasPermission('create:visitors'), validateRequest(updateVisitorSchema), checkOutVisitor);
router.get('/today', protect, hasPermission('read:visitors'), getSocietyVisitors);

// Admin-only: full visitor history
router.get('/all', protect, hasPermission('manage:visitors'), getSocietyVisitors);

// Member: see visitors to their own flat
router.get('/my-visitors', protect, hasPermission('read:visitors'), getMyVisitors);

module.exports = router;
