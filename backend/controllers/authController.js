const User = require('../models/User');
const Society = require('../models/Society');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ADMIN_SECRET = "SOCIETY_ADMIN_2025"; 

// --- 1. REGISTER (For Society Admins) ---
const registerUser = async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      societyName, address, regNumber, wings, floors, flatsPerFloor, 
      societyId, flatDetails, secretCode 
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Validate Admin Secret
    if (role === 'admin' && secretCode !== ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid Admin Secret Code" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let assignedSocietyId;

    // Create Society if Admin
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
      // Logic for members registering themselves (if enabled)
      if (!societyId) return res.status(400).json({ message: "Please select a Society to join" });
      assignedSocietyId = societyId;
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'member',
      societyId: assignedSocietyId, // <--- Using 'societyId' to match Model
      flatDetails: role === 'member' ? flatDetails : undefined
    });

    // Link Society to Admin
    if (role === 'admin') {
      await Society.findByIdAndUpdate(assignedSocietyId, { createdBy: user._id });
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- 2. LOGIN ---
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and get their Society details
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Populate using 'societyId'
    await user.populate('societyId', 'name');

    const token = jwt.sign(
      { id: user._id, role: user.role, societyId: user.societyId?._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        societyId: user.societyId?._id, // Send ID for frontend use
        societyName: user.societyId ? user.societyId.name : 'Unknown Society'
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- 3. GET ALL USERS (For Admin Dashboard) ---
const getAllUsers = async (req, res) => {
  try {
    // Filter by the logged-in admin's societyId
    const mySocietyId = req.user.societyId;
    
    const users = await User.find({ societyId: mySocietyId, role: 'member' })
                            .select('-password')
                            .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. GET ALL SOCIETIES ---
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

// --- 6. ADD MEMBER (By Admin) ---
const addMember = async (req, res) => {
  try {
    // 1. Extract residentType from body
    const { name, email, password, wing, floor, flatNumber, residentType } = req.body;

    // 2. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create User (Linked to Admin's Society)
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'member',
      societyId: req.user.societyId, // <--- Using 'societyId'
      flatDetails: {
        wing,
        floor,
        flatNumber,
        residentType: residentType || 'Owner' // <--- Save Status (Default to Owner)
      }
    });

    res.status(201).json({ message: 'Member added successfully' });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// --- 7. UPDATE MEMBER (Admin) ---
const updateMember = async (req, res) => {
  try {
    const { name, email, wing, floor, flatNumber, residentType } = req.body;
    
    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update basic info
    user.name = name || user.name;
    user.email = email || user.email;

    // Update flat details if provided
    if (user.flatDetails) {
      user.flatDetails.wing = wing || user.flatDetails.wing;
      user.flatDetails.floor = floor || user.flatDetails.floor;
      user.flatDetails.flatNumber = flatNumber || user.flatDetails.flatNumber;
      user.flatDetails.residentType = residentType || user.flatDetails.residentType;
    }

    await user.save();
    res.json({ message: "Member updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 8. GET SOCIETY LIMITS (For Form Dropdowns) ---
const getSocietyLimits = async (req, res) => {
  try {
    const society = await Society.findById(req.user.societyId);
    if (!society) return res.status(404).json({ message: "Society not found" });

    res.json({
      wings: society.wings,           // e.g. ["A", "B"]
      floors: society.floors,         // e.g. 10
      flatsPerFloor: society.flatsPerFloor // e.g. 4
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- EXPORT ALL FUNCTIONS ---
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getAllSocieties,
  deleteUser,
  addMember,
  updateMember,
  getSocietyLimits
};