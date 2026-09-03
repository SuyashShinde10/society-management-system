const express = require('express');
const router = express.Router();
const { createEscrow, verifyGeofence, verifyResident, getAllEscrows } = require('../controllers/escrowController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createEscrowSchema, verifyGeofenceSchema } = require('../validations/schemas');

router.get('/', protect, getAllEscrows);

router.post('/', protect, validateRequest(createEscrowSchema), createEscrow);
router.post('/verify/geofence', validateRequest(verifyGeofenceSchema), verifyGeofence); // Public or vendor specific
router.post('/verify/resident', protect, verifyResident); // Protected by resident auth

module.exports = router;
