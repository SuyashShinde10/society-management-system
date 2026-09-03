const express = require('express');
const router = express.Router();
const { initiateDispute, sendMessage } = require('../controllers/disputeController');
const { protect } = require('../middleware/authMiddleware'); // User must be authenticated
const validateRequest = require('../middleware/validateRequest');
const { initiateDisputeSchema, sendMessageSchema } = require('../validations/schemas');

router.post('/initiate', protect, validateRequest(initiateDisputeSchema), initiateDispute);
router.post('/message', protect, validateRequest(sendMessageSchema), sendMessage);

module.exports = router;
