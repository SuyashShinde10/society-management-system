const express = require('express');
const router = express.Router();
const { 
  getNotices, 
  addNotice, 
  deleteNotice,
} = require('../controllers/noticeController');

const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const { createNoticeSchema } = require('../validations/schemas');

// Any authenticated user with 'read:notices' can view notices
router.get('/', protect, hasPermission('read:notices'), getNotices);

// Admin-only create and delete — 'manage:notices' permission
router.post('/', protect, hasPermission('manage:notices'), validateRequest(createNoticeSchema), addNotice);
router.delete('/:id', protect, hasPermission('manage:notices'), deleteNotice);

module.exports = router;