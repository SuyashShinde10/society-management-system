const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  getAllSocieties, 
  deleteUser,
  addMember // <--- New Import
} = require('../controllers/authController');

const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/societies', getAllSocieties);

// Protected Routes
router.get('/users', protect, admin, getAllUsers);
router.post('/add-member', protect, admin, addMember); // <--- New Route
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;