const express = require('express');
const router = express.Router();

const {
  sendOTP, verifyOTP,
  registerUser, loginUser, updateProfile,
  getAllUsers, getSecurityStaff, getPendingMembers, deleteUser, addMember, updateMember, getSocietyLimits, approveMember, seedSuperAdmin,
  forgotPassword, resetPassword, addSecurityStaff, updateSecurityStaff, terminateSecurityStaff
} = require('../controllers/authController');

const { protect, admin } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  skip: (req, res) => process.env.NODE_ENV !== 'production'
});

// ── PUBLIC ──────────────────────────────────────────────────────────────────
router.post('/send-otp', authLimiter, sendOTP);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/register', authLimiter, registerUser);               // Admin creates society
router.post('/login', authLimiter, loginUser);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/seed-superadmin', seedSuperAdmin);

// ── ANY LOGGED-IN USER ───────────────────────────────────────────────────────
router.put('/profile', protect, updateProfile);
router.get('/society-limits', protect, getSocietyLimits);

// ── ADMIN ONLY ───────────────────────────────────────────────────────────────
router.get('/users', protect, admin, getAllUsers);
router.get('/security-staff', protect, admin, getSecurityStaff);
router.get('/pending-members', protect, admin, getPendingMembers);
router.post('/add-member', protect, admin, addMember);
router.post('/add-security-staff', protect, admin, addSecurityStaff);
router.put('/approve-member/:id', protect, admin, approveMember);
router.delete('/user/:id', protect, admin, deleteUser);
router.put('/user/:id', protect, admin, updateMember);
router.put('/security-staff/:id', protect, admin, updateSecurityStaff);
router.put('/security-staff/:id/terminate', protect, admin, terminateSecurityStaff);

module.exports = router;