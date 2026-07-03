const express = require('express');
const router = express.Router();
const { generateBills, getBills, markBillPaid, deleteBill } = require('../controllers/billController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getBills);
router.post('/generate', protect, admin, generateBills);
router.put('/:id/pay', protect, admin, markBillPaid);
router.delete('/:id', protect, admin, deleteBill);

module.exports = router;
