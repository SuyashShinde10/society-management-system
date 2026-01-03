const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  getAllSocieties, 
  deleteUser,
  addMember,
  updateMember,
  getSocietyLimits
} = require('../controllers/authController');

// Import both middlewares
const { protect, admin } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/societies', getAllSocieties);

// --- PROTECTED ROUTES (Admin Only) ---
// Note: We use 'protect' to identify user, 'admin' to check role
router.get('/users', protect, admin, getAllUsers);
router.post('/add-member', protect, admin, addMember);
router.delete('/user/:id', protect, admin, deleteUser); // Changed to /user/:id to match typical conventions
router.put('/user/:id', protect, admin, updateMember); // For editing members

// --- PROTECTED ROUTES (Any Logged In User) ---
router.get('/society-limits', protect, getSocietyLimits);

module.exports = router;