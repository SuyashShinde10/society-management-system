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

const { protect, admin } = require('../middleware/authMiddleware');

// --- PUBLIC ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/societies', getAllSocieties);

// --- ADMIN ONLY ---
router.get('/users', protect, admin, getAllUsers);
router.post('/add-member', protect, admin, addMember);
router.delete('/user/:id', protect, admin, deleteUser);
router.put('/user/:id', protect, admin, updateMember);

// --- ALL LOGGED IN USERS ---
router.get('/society-limits', protect, getSocietyLimits);

module.exports = router;