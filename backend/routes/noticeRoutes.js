const express = require('express');
const router = express.Router();
const { 
  getNotices, 
  addNotice, 
  deleteNotice // <--- Ensure this is imported
} = require('../controllers/noticeController');

const { protect } = require('../middleware/authMiddleware');

// Define Routes
router.get('/', protect, getNotices);
router.post('/', protect, addNotice);

// This line was crashing because deleteNotice was undefined
router.delete('/:id', protect, deleteNotice); 

module.exports = router;