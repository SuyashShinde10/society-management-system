const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/rbac');
const validateRequest = require('../middleware/validateRequest');
const { allocateParkingSchema, verifyParkingSchema } = require('../validations/schemas');
const { createParkingSpace, enforceParking, getAllParkingSpaces, alprScan } = require('../controllers/parkingController');

// manage:parking — admins and security guards can allocate, enforce, and run ALPR
router.post('/', protect, hasPermission('manage:parking'), validateRequest(allocateParkingSchema), createParkingSpace);
router.post('/enforce', protect, hasPermission('manage:parking'), enforceParking);
router.post('/alpr', protect, hasPermission('manage:parking'), validateRequest(verifyParkingSchema), alprScan);

// read:parking — any member+ can see parking spaces
router.get('/', protect, hasPermission('read:parking'), getAllParkingSpaces);

module.exports = router;
