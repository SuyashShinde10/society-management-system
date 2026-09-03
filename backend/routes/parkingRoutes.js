const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { allocateParkingSchema, verifyParkingSchema } = require('../validations/schemas');
const { createParkingSpace, enforceParking, getAllParkingSpaces, alprScan } = require('../controllers/parkingController');

router.post('/', protect, validateRequest(allocateParkingSchema), createParkingSpace);
router.post('/enforce', protect, enforceParking);
router.get('/', protect, getAllParkingSpaces);
router.post('/alpr', protect, validateRequest(verifyParkingSchema), alprScan);

module.exports = router;
