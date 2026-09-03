const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { queryChatbot } = require('../controllers/chatbotController');

router.post('/query', protect, queryChatbot);

module.exports = router;
