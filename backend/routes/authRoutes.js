const express = require('express');
const router = express.Router();

const {
  registerUser, loginUser, updateProfile,
  getAllUsers, deleteUser, addMember, updateMember, getSocietyLimits
} = require('../controllers/authController');

const { protect, admin } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// ── PUBLIC ──────────────────────────────────────────────────────────────────
router.post('/register', authLimiter, registerUser);               // Admin creates society
router.post('/login', authLimiter, loginUser);

// ── ANY LOGGED-IN USER ───────────────────────────────────────────────────────
router.put('/profile', protect, updateProfile);
router.get('/society-limits', protect, getSocietyLimits);

// ── ADMIN ONLY ───────────────────────────────────────────────────────────────
router.get('/users', protect, admin, getAllUsers);
router.post('/add-member', protect, admin, addMember);
router.delete('/user/:id', protect, admin, deleteUser);
router.put('/user/:id', protect, admin, updateMember);

module.exports = router;