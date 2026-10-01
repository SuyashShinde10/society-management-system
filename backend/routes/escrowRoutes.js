const express = require('express');
const router = express.Router();
const { createEscrow, verifyGeofence, verifyResident, getAllEscrows } = require('../controllers/escrowController');
const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const { createEscrowSchema, verifyGeofenceSchema, verifyResidentSchema } = require('../validations/schemas');

router.get('/', protect, getAllEscrows);

// RBAC: only admins/superadmins with 'manage:escrow' permission can create escrow accounts
router.post('/', protect, hasPermission('manage:escrow'), validateRequest(createEscrowSchema), createEscrow);
// Public or vendor-triggered geofence verification (no auth — contractor pings this from job site)
router.post('/verify/geofence', validateRequest(verifyGeofenceSchema), verifyGeofence);
// Resident verification — requires auth + Zod body validation for escrowId
router.post('/verify/resident', protect, validateRequest(verifyResidentSchema), verifyResident);

module.exports = router;
