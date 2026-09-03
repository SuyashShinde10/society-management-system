const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { submitAdBidSchema } = require('../validations/schemas');
const { getActiveAds, submitBid } = require('../controllers/adController');

router.get('/', protect, getActiveAds);
router.post('/bid/:societyId', validateRequest(submitAdBidSchema), submitBid); // Public for vendors

module.exports = router;
