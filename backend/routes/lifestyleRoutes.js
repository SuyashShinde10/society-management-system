const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAmenities,
  createAmenity,
  bookSlot,
  getBookings,
  createClassified,
  getClassifieds,
  createResolution,
  getResolutions,
  castVote
} = require('../controllers/lifestyleController');

// Amenities
router.get('/amenities', protect, getAmenities);
router.post('/amenities', protect, createAmenity);
router.post('/amenities/book', protect, bookSlot);
router.get('/amenities/bookings', protect, getBookings);

// Classifieds
router.get('/classifieds', protect, getClassifieds);
router.post('/classifieds', protect, createClassified);

// Resolutions (AGM)
router.get('/resolutions', protect, getResolutions);
router.post('/resolutions', protect, createResolution);
router.post('/resolutions/:id/vote', protect, castVote);

module.exports = router;
