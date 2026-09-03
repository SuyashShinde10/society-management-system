const express = require('express');
const router = express.Router();
const { generateBills, getBills, markBillPaid, deleteBill, createCheckout, verifyStripePayment } = require('../controllers/billController');
const { protect, admin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { generateBillSchema, markBillPaidSchema } = require('../validations/schemas');

router.get('/', protect, getBills);
router.post('/generate', protect, admin, validateRequest(generateBillSchema), generateBills);
router.post('/verify-payment', protect, verifyStripePayment);
router.post('/:id/checkout', protect, createCheckout);
router.put('/:id/pay', protect, validateRequest(markBillPaidSchema), markBillPaid);
router.delete('/:id', protect, admin, deleteBill);

module.exports = router;
