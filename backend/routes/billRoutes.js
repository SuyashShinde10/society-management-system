const express = require('express');
const router = express.Router();
const { generateBills, getBills, markBillPaid, deleteBill, createCheckout, verifyStripePayment, sendDueReminders, sendOverdueAlerts } = require('../controllers/billController');
const { protect, admin } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const { generateBillSchema, markBillPaidSchema } = require('../validations/schemas');

// Member read — guarded by 'read:bills' permission
router.get('/', protect, hasPermission('read:bills'), getBills);

// Admin-only mutations — guarded by semantic 'manage:bills' permission
router.post('/generate', protect, hasPermission('manage:bills'), validateRequest(generateBillSchema), generateBills);
router.post('/reminders', protect, hasPermission('manage:bills'), sendDueReminders);
router.post('/overdue-reminders', protect, hasPermission('manage:bills'), sendOverdueAlerts);
router.delete('/:id', protect, hasPermission('manage:bills'), deleteBill);

// Stripe payment flow — any authenticated user can trigger/verify their own payment
router.post('/verify-payment', protect, verifyStripePayment);
router.post('/:id/checkout', protect, createCheckout);

// Pay/record — member pays their own, admin marks any paid (service-layer enforces ownership)
router.put('/:id/pay', protect, validateRequest(markBillPaidSchema), markBillPaid);

module.exports = router;
