const User = require('../models/User');
const Society = require('../models/Society');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- 1. REGISTER (For Society Admins) ---
const registerUser = async (req, res) => {
  try {
    const {
      name, email, password, role,
      societyName, address, regNumber, wings, floors, flatsPerFloor,
      societyId, flatDetails, secretCode
    } = req.body;

    // A. Basic field validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'NAME_EMAIL_PASSWORD_REQUIRED' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'EMAIL_ALREADY_IN_USE' });

    // B. Admin Verification
    if (role === 'admin') {
      if (!secretCode || secretCode !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'INVALID_ADMIN_SECRET_KEY' });
      }
    }

    // C. Data Integrity
    const castedFloors = Number(floors);
    const castedFlats = Number(flatsPerFloor);

    // D. Password Security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let assignedSocietyId;

    // E. Society Deployment Logic
    if (role === 'admin') {
      if (!societyName || !address || !regNumber) {
        return res.status(400).json({ message: 'SOCIETY_METADATA_MISSING' });
      }

      const societyCheck = await Society.findOne({ regNumber });
      if (societyCheck) return res.status(400).json({ message: 'SOCIETY_REGISTRATION_EXISTS' });

      const newSociety = await Society.create({
        name: societyName,
        address,
        regNumber,
        wings: Array.isArray(wings) ? wings : (typeof wings === 'string' ? wings.split(',') : []),
        floors: castedFloors,
        flatsPerFloor: castedFlats
      });
      assignedSocietyId = newSociety._id;
    } else {
      if (!societyId) return res.status(400).json({ message: 'TARGET_SOCIETY_NOT_SELECTED' });
      // Verify societyId actually exists
      const societyExists = await Society.findById(societyId);
      if (!societyExists) return res.status(400).json({ message: 'SOCIETY_NOT_FOUND' });
      assignedSocietyId = societyId;
    }

    // F. User Creation
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'member',
      societyId: assignedSocietyId,
      flatDetails: role === 'member' ? flatDetails : undefined
    });

    // G. Finalize Admin Link
    if (role === 'admin') {
      await Society.findByIdAndUpdate(assignedSocietyId, { createdBy: user._id });
    }

    res.status(201).json({ message: 'REGISTRY_INITIALIZED_SUCCESSFULLY' });
  } catch (error) {
    console.error('// REGISTER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_REGISTRY_ERROR' });
  }
};

// --- 2. LOGIN ---
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'EMAIL_AND_PASSWORD_REQUIRED' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'CREDENTIALS_REJECTED' });
    }

    // Populate society data
    await user.populate('societyId', 'name');

    const token = jwt.sign(
      { id: user._id, role: user.role, societyId: user.societyId?._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        societyId: user.societyId?._id,
        societyName: user.societyId ? user.societyId.name : 'UNLINKED_CORE'
      }
    });
  } catch (error) {
    console.error('// LOGIN_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// --- 3. GET ALL USERS (Admin Only) ---
const getAllUsers = async (req, res) => {
  try {
    const mySocietyId = req.user.societyId;
    const users = await User.find({ societyId: mySocietyId, role: 'member' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('// GET_USERS_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// --- 4. GET ALL SOCIETIES (Public — required for member registration dropdown) ---
const getAllSocieties = async (req, res) => {
  try {
    // Return only name — no addresses or internal IDs exposed beyond what is needed
    const societies = await Society.find({}, 'name');
    res.json(societies);
  } catch (error) {
    console.error('// GET_SOCIETIES_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// --- 5. DELETE USER (Admin Only) ---
const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'USER_NOT_FOUND' });

    // Ensure admin can only delete members within their own society
    if (userToDelete.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'AUTH_DOMAIN_MISMATCH' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'RECORD_DELETED' });
  } catch (error) {
    console.error('// DELETE_USER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// --- 6. ADD MEMBER (Admin Only) ---
const addMember = async (req, res) => {
  try {
    const { name, email, password, wing, floor, flatNumber, residentType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'NAME_EMAIL_PASSWORD_REQUIRED' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'USER_IDENT_ALREADY_EXISTS' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'member',
      societyId: req.user.societyId,
      flatDetails: {
        wing,
        floor: Number(floor),
        flatNumber,
        residentType: residentType || 'Owner'
      }
    });

    res.status(201).json({ message: 'MEMBER_ADDED_TO_REGISTRY' });
  } catch (error) {
    console.error('// ADD_MEMBER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// --- 7. UPDATE MEMBER (Admin Only) ---
const updateMember = async (req, res) => {
  try {
    const { name, email, wing, floor, flatNumber, residentType } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'RECORD_NOT_FOUND' });

    // ✅ SECURITY FIX (C2): Ensure admin can only update members of their own society
    if (user.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'AUTH_DOMAIN_MISMATCH' });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (user.flatDetails) {
      if (wing) user.flatDetails.wing = wing;
      if (floor !== undefined) user.flatDetails.floor = Number(floor);
      if (flatNumber) user.flatDetails.flatNumber = flatNumber;
      if (residentType) user.flatDetails.residentType = residentType;
    }

    await user.save();
    // Do not return full user object — strip password just in case
    const { password: _, ...safeUser } = user.toObject();
    res.json({ message: 'RECORD_MODIFIED', user: safeUser });
  } catch (error) {
    console.error('// UPDATE_MEMBER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// --- 8. GET SOCIETY LIMITS ---
const getSocietyLimits = async (req, res) => {
  try {
    const society = await Society.findById(req.user.societyId);
    if (!society) return res.status(404).json({ message: 'DOMAIN_NOT_FOUND' });

    res.json({
      wings: society.wings,
      floors: society.floors,
      flatsPerFloor: society.flatsPerFloor
    });
  } catch (error) {
    console.error('// GET_LIMITS_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = {
  registerUser, loginUser, getAllUsers, getAllSocieties,
  deleteUser, addMember, updateMember, getSocietyLimits
};