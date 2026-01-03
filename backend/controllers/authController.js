const User = require('../models/User');
const Society = require('../models/Society');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ADMIN_SECRET = "SOCIETY_ADMIN_2025"; 

// --- 1. REGISTER ---
const registerUser = async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      societyName, address, regNumber, wings, floors, flatsPerFloor, 
      societyId, flatDetails, secretCode 
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    if (role === 'admin' && secretCode !== ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid Admin Secret Code" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let assignedSocietyId;

    if (role === 'admin') {
      if (!societyName || !address || !regNumber) {
        return res.status(400).json({ message: "Building details are required for Admins" });
      }
      const newSociety = await Society.create({
        name: societyName,
        address,
        regNumber,
        wings: wings ? wings.split(',') : [],
        floors,
        flatsPerFloor
      });
      assignedSocietyId = newSociety._id;
    } else {
      if (!societyId) return res.status(400).json({ message: "Please select a Society to join" });
      assignedSocietyId = societyId;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'member',
      society: assignedSocietyId,
      flatDetails: role === 'member' ? flatDetails : undefined
    });

    if (role === 'admin') {
      await Society.findByIdAndUpdate(assignedSocietyId, { createdBy: user._id });
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 2. LOGIN ---
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    await user.populate('society', 'name');

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        societyName: user.society ? user.society.name : 'Unknown Society'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 3. GET ALL USERS ---
const getAllUsers = async (req, res) => {
  try {
    const mySocietyId = req.user.society;
    const users = await User.find({ society: mySocietyId, role: 'member' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. GET ALL SOCIETIES (THIS IS THE MISSING FUNCTION) ---
const getAllSocieties = async (req, res) => {
  try {
    const societies = await Society.find({}, 'name address');
    res.json(societies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 5. DELETE USER ---
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. ADD MEMBER (By Admin)
const addMember = async (req, res) => {
  try {
    const { name, email, password, wing, floor, flatNumber } = req.body;

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User (Linked to Admin's Society)
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'member',
      society: req.user.society, // <--- Auto-assign to Admin's society
      flatDetails: {
        wing,
        floor,
        flatNumber
      }
    });

    res.status(201).json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- EXPORT ALL FUNCTIONS TOGETHER ---
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getAllSocieties, // <--- Ensure this is here
  deleteUser,
  addMember
};