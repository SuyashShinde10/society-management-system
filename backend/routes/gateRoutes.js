const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  logParcel,
  claimParcel,
  getParcels,
  addStaff,
  getAllStaff,
  checkInStaff,
  checkOutStaff,
  createGuestPass,
  verifyGuestPass,
  getGuestPasses
} = require('../controllers/gateController');

// Parcels
router.get('/parcels', protect, getParcels);
router.post('/parcels', protect, logParcel);
router.post('/parcels/claim', protect, claimParcel);

// Staff
router.get('/staff', protect, getAllStaff);
router.post('/staff', protect, addStaff);
router.post('/staff/:id/checkin', protect, checkInStaff);
router.post('/staff/:id/checkout', protect, checkOutStaff);

// Guest Passes
router.get('/passes', protect, getGuestPasses);
router.post('/passes', protect, createGuestPass);
router.post('/passes/verify', protect, verifyGuestPass);

module.exports = router;
