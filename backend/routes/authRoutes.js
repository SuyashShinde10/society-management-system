const express = require('express');
const router = express.Router();

const {
  registerUser, memberSelfRegister, loginUser, updateProfile,
  getAllUsers, getPendingMembers, approveMember,
  getAllSocieties, deleteUser, addMember, updateMember, getSocietyLimits
} = require('../controllers/authController');

const { protect, admin } = require('../middleware/authMiddleware');

// ── PUBLIC ──────────────────────────────────────────────────────────────────
router.post('/register', registerUser);               // Admin creates society
router.post('/member-register', memberSelfRegister);  // Member self-register (pending approval)
router.post('/login', loginUser);
router.get('/societies', getAllSocieties);             // Public — needed for member registration dropdown

// ── ANY LOGGED-IN USER ───────────────────────────────────────────────────────
router.put('/profile', protect, updateProfile);
router.get('/society-limits', protect, getSocietyLimits);

// ── ADMIN ONLY ───────────────────────────────────────────────────────────────
router.get('/users', protect, admin, getAllUsers);
router.get('/users/pending', protect, admin, getPendingMembers);
router.put('/users/:id/approve', protect, admin, approveMember);
router.post('/add-member', protect, admin, addMember);
router.delete('/user/:id', protect, admin, deleteUser);
router.put('/user/:id', protect, admin, updateMember);

module.exports = router;