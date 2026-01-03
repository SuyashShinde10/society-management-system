const express = require('express');
const router = express.Router();

// Import using destructuring (Must match exports above)
const { 
  getNotices, 
  addNotice, 
  deleteNotice 
} = require('../controllers/noticeController');

const { protect, admin } = require('../middleware/authMiddleware');

// Define Routes
router.get('/', protect, getNotices);
router.post('/', protect, admin, addNotice);
router.delete('/:id', protect, admin, deleteNotice);

module.exports = router;