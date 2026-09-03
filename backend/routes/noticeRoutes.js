const express = require('express');
const router = express.Router();
const { 
  getNotices, 
  addNotice, 
  deleteNotice // <--- Ensure this is imported
} = require('../controllers/noticeController');

const { protect, admin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createNoticeSchema } = require('../validations/schemas');

// Define Routes
router.get('/', protect, getNotices);
router.post('/', protect, admin, validateRequest(createNoticeSchema), addNotice);

// This line was crashing because deleteNotice was undefined
router.delete('/:id', protect, admin, deleteNotice); 

module.exports = router;