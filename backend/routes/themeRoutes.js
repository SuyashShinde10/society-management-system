const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getTheme, updateTheme } = require('../controllers/themeController');

router.get('/', protect, getTheme);
router.put('/', protect, adminOnly, updateTheme);

module.exports = router;
