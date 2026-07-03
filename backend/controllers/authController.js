const User = require('../models/User');
const Society = require('../models/Society');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── 1. REGISTER (Admin creates society) ─────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const {
      name, email, password, role, secretCode,
      societyName, address, regNumber, wings, floors, flatsPerFloor,
      city, state, pincode, maintenanceAmount,
      societyId, flatDetails
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'NAME_EMAIL_PASSWORD_REQUIRED' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'EMAIL_ALREADY_IN_USE' });

    if (role === 'admin') {
      if (!secretCode || secretCode !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'INVALID_ADMIN_SECRET_KEY' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let assignedSocietyId;

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
        floors: Number(floors),
        flatsPerFloor: Number(flatsPerFloor),
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        maintenanceAmount: Number(maintenanceAmount) || 0,
      });
      assignedSocietyId = newSociety._id;
    } else {
      if (!societyId) return res.status(400).json({ message: 'TARGET_SOCIETY_NOT_SELECTED' });
      const societyExists = await Society.findById(societyId);
      if (!societyExists) return res.status(400).json({ message: 'SOCIETY_NOT_FOUND' });
      assignedSocietyId = societyId;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'member',
      societyId: assignedSocietyId,
      flatDetails: role === 'member' ? flatDetails : undefined,
    });

    if (role === 'admin') {
      await Society.findByIdAndUpdate(assignedSocietyId, { createdBy: user._id });
    }

    res.status(201).json({ message: 'REGISTRY_INITIALIZED_SUCCESSFULLY' });
  } catch (error) {
    console.error('// REGISTER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_REGISTRY_ERROR' });
  }
};

// ─── 2. MEMBER SELF-REGISTER ───────────────────────────────────────────────
const memberSelfRegister = async (req, res) => {
  try {
    const { name, email, password, societyId, wing, floor, flatNumber, residentType, phone } = req.body;

    if (!name || !email || !password || !societyId) {
      return res.status(400).json({ message: 'ALL_FIELDS_REQUIRED' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'EMAIL_ALREADY_IN_USE' });

    const societyExists = await Society.findById(societyId);
    if (!societyExists) return res.status(400).json({ message: 'SOCIETY_NOT_FOUND' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name, email,
      password: hashedPassword,
      role: 'member',
      societyId,
      phone,
      flatDetails: { wing, floor, flatNumber, residentType: residentType || 'Owner' },
      isActive: false, // Pending admin approval
    });

    res.status(201).json({ message: 'REGISTRATION_PENDING_ADMIN_APPROVAL' });
  } catch (error) {
    console.error('// MEMBER_SELF_REGISTER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 3. LOGIN ─────────────────────────────────────────────────────────────────
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

    // Block inactive (pending approval) accounts
    if (user.isActive === false) {
      return res.status(403).json({ message: 'ACCOUNT_PENDING_APPROVAL — Contact your society admin.' });
    }

    await user.populate('societyId', 'name city maintenanceAmount');

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
        phone: user.phone,
        societyId: user.societyId?._id,
        societyName: user.societyId?.name || 'UNLINKED',
        societyCity: user.societyId?.city || '',
        flatDetails: user.flatDetails,
        parkingSlot: user.parkingSlot,
        vehicleNumber: user.vehicleNumber,
      }
    });
  } catch (error) {
    console.error('// LOGIN_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 4. UPDATE OWN PROFILE ────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, parkingSlot, vehicleNumber, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND' });

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (parkingSlot !== undefined) user.parkingSlot = parkingSlot;
    if (vehicleNumber !== undefined) user.vehicleNumber = vehicleNumber;

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'CURRENT_PASSWORD_REQUIRED' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'CURRENT_PASSWORD_INCORRECT' });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    const { password: _, ...safeUser } = user.toObject();
    res.json({ message: 'PROFILE_UPDATED', user: safeUser });
  } catch (error) {
    console.error('// UPDATE_PROFILE_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 5. GET ALL USERS (Admin) ─────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ societyId: req.user.societyId, role: 'member' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('// GET_USERS_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 6. GET PENDING MEMBERS (Admin) ───────────────────────────────────────────
const getPendingMembers = async (req, res) => {
  try {
    const users = await User.find({
      societyId: req.user.societyId, role: 'member', isActive: false
    }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('// GET_PENDING_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 7. APPROVE MEMBER (Admin) ────────────────────────────────────────────────
const approveMember = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND' });

    if (user.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    user.isActive = true;
    await user.save();
    res.json({ message: 'MEMBER_APPROVED' });
  } catch (error) {
    console.error('// APPROVE_MEMBER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 8. GET ALL SOCIETIES (Public) ───────────────────────────────────────────
const getAllSocieties = async (req, res) => {
  try {
    const societies = await Society.find({}, 'name city');
    res.json(societies);
  } catch (error) {
    console.error('// GET_SOCIETIES_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 9. DELETE USER (Admin) ───────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: 'USER_NOT_FOUND' });

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

// ─── 10. ADD MEMBER (Admin) ───────────────────────────────────────────────────
const addMember = async (req, res) => {
  try {
    const { name, email, password, wing, floor, flatNumber, residentType, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'NAME_EMAIL_PASSWORD_REQUIRED' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'USER_IDENT_ALREADY_EXISTS' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name, email,
      password: hashedPassword,
      role: 'member',
      societyId: req.user.societyId,
      phone,
      isActive: true,
      flatDetails: { wing, floor: Number(floor), flatNumber, residentType: residentType || 'Owner' }
    });

    res.status(201).json({ message: 'MEMBER_ADDED_TO_REGISTRY' });
  } catch (error) {
    console.error('// ADD_MEMBER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 11. UPDATE MEMBER (Admin) ────────────────────────────────────────────────
const updateMember = async (req, res) => {
  try {
    const { name, email, wing, floor, flatNumber, residentType, phone, parkingSlot, vehicleNumber } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'RECORD_NOT_FOUND' });

    if (user.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'AUTH_DOMAIN_MISMATCH' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (parkingSlot !== undefined) user.parkingSlot = parkingSlot;
    if (vehicleNumber !== undefined) user.vehicleNumber = vehicleNumber;

    if (!user.flatDetails) user.flatDetails = {};
    if (wing) user.flatDetails.wing = wing;
    if (floor !== undefined) user.flatDetails.floor = Number(floor);
    if (flatNumber) user.flatDetails.flatNumber = flatNumber;
    if (residentType) user.flatDetails.residentType = residentType;

    await user.save();
    const { password: _, ...safeUser } = user.toObject();
    res.json({ message: 'RECORD_MODIFIED', user: safeUser });
  } catch (error) {
    console.error('// UPDATE_MEMBER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 12. SOCIETY LIMITS ───────────────────────────────────────────────────────
const getSocietyLimits = async (req, res) => {
  try {
    const society = await Society.findById(req.user.societyId);
    if (!society) return res.status(404).json({ message: 'DOMAIN_NOT_FOUND' });
    res.json({ wings: society.wings, floors: society.floors, flatsPerFloor: society.flatsPerFloor });
  } catch (error) {
    console.error('// GET_LIMITS_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = {
  registerUser, memberSelfRegister, loginUser, updateProfile,
  getAllUsers, getPendingMembers, approveMember,
  getAllSocieties, deleteUser, addMember, updateMember, getSocietyLimits
};