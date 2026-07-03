const express = require('express');
const router = express.Router();
const { logVisitor, getVisitors, markExit, deleteVisitor } = require('../controllers/visitorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getVisitors);
router.post('/', protect, logVisitor);
router.put('/:id/exit', protect, markExit);
router.delete('/:id', protect, admin, deleteVisitor);

module.exports = router;
