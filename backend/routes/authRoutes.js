const express = require('express');
const router = express.Router();

const { sendOTP, verifyOTP } = require('../controllers/auth.otp.controller');
const { registerUser } = require('../controllers/auth.register.controller');
const { loginUser, getMe, forgotPassword, resetPassword, logoutUser } = require('../controllers/auth.login.controller');
const { 
  updateProfile,
  getSocietyLimits, seedSuperAdmin
} = require('../controllers/auth.admin.controller');

const {
  getAllUsers, getPendingMembers, approveMember, deleteUser,
  addMember, updateMember
} = require('../controllers/member.controller');

const {
  getSecurityStaff, addSecurityStaff, updateSecurityStaff, terminateSecurityStaff,
  getSecurityLogs
} = require('../controllers/securityStaff.controller');

const { protect, admin } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const validateRequest = require('../middleware/validateRequest');
const { sendOtpSchema, verifyOtpSchema, loginSchema, registerAdminSchema } = require('../validations/schemas');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  skip: (req, res) => process.env.NODE_ENV !== 'production'
});

// ── PUBLIC ──────────────────────────────────────────────────────────────────
router.post('/send-otp', authLimiter, validateRequest(sendOtpSchema), sendOTP);
router.post('/verify-otp', authLimiter, validateRequest(verifyOtpSchema), verifyOTP);
router.post('/register', authLimiter, validateRequest(registerAdminSchema), registerUser);
router.post('/login', authLimiter, validateRequest(loginSchema), loginUser);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/seed-superadmin', authLimiter, seedSuperAdmin);

// ── ANY LOGGED-IN USER ───────────────────────────────────────────────────────
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/society-limits', protect, getSocietyLimits);
router.post('/logout', protect, logoutUser);

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
router.get('/security-logs', protect, admin, getSecurityLogs);

module.exports = router;