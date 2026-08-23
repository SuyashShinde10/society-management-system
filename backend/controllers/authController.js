const User = require('../models/User');
const SecurityStaff = require('../models/SecurityStaff');
const Society = require('../models/Society');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const { getProfessionalEmailTemplate } = require('../utils/emailTemplates');

// OTP store
const Otp = require('../models/Otp');
const AuditLog = require('../models/AuditLog');

// ─── 0. SEND OTP ─────────────────────────────────────────────────────────────
const sendOTP = async (req, res) => {
  try {
    const { email, societyName, adminName, adminEmail } = req.body;
    if (!email) return res.status(400).json({ message: 'EMAIL_REQUIRED' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // --- DEV MODE HELPER: Print OTP to console since email might fail ---
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n=========================================`);
      console.log(`🔑 DEV MODE OTP FOR ${email}: ${otp}`);
      console.log(`=========================================\n`);
    }

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    const templateSubtitle = societyName ? `SECURE DEPLOYMENT PROTOCOL - ${societyName.toUpperCase()}` : 'SECURE DEPLOYMENT PROTOCOL';
    const templateBodyText = adminName 
      ? `You are one step away from joining <strong>${societyName}</strong>. Society admin <strong>${adminName}</strong> (<a href="mailto:${adminEmail}">${adminEmail}</a>) has initiated your onboarding. Please use the verification code below to authorize your registration.`
      : 'You are one step away from deploying your society system. Please use the verification code below to authorize your registration.';

    const html = getProfessionalEmailTemplate({
      subtitle: templateSubtitle,
      greeting: 'Hello,',
      bodyText: templateBodyText,
      highlightBox: otp,
      highlightBoxLabel: 'Verification Code',
      warningText: 'This code expires in exactly 120 seconds.',
      footerText: societyName ? `Sent on behalf of ${societyName}` : undefined
    });

    await sendEmail({
      email,
      subject: 'Awaastech Society Deployment - Verification Code',
      message: `Your verification code is: ${otp}\n\nThis code expires in 120 seconds.`,
      html
    });

    res.json({ message: 'OTP_SENT_SUCCESSFULLY' });
  } catch (error) {
    console.error('// SEND_OTP_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 0. VERIFY OTP ───────────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOtp = await Otp.findOne({ email });
    if (!storedOtp) return res.status(400).json({ message: 'OTP_NOT_REQUESTED_OR_EXPIRED' });

    if (storedOtp.attempts >= 5) {
      await Otp.deleteOne({ email });
      return res.status(429).json({ message: 'OTP_MAX_ATTEMPTS_EXCEEDED' });
    }

    if (storedOtp.otp !== otp) {
      storedOtp.attempts += 1;
      await storedOtp.save();
      return res.status(400).json({ message: 'INVALID_OTP' });
    }

    // We don't delete the OTP here so that registerUser can verify it one final time securely.
    res.json({ success: true, message: 'EMAIL_VERIFIED' });
  } catch (error) {
    console.error('// VERIFY_OTP_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 1. REGISTER (Admin creates society) ─────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const {
      name, email, password, role, secretCode,
      societyName, address, regNumber, wings, floors, flatsPerFloor,
      city, state, pincode, maintenanceAmount,
      societyId, flatDetails, otp
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'NAME_EMAIL_PASSWORD_REQUIRED' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'PASSWORD_MIN_8_CHARS' });
    }
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'EMAIL_ALREADY_IN_USE' });

    if (role !== 'admin') {
      return res.status(403).json({ message: 'ONLY_ADMIN_REGISTRATION_ALLOWED' });
    }
    if (role === 'admin') {
      const storedOtp = await Otp.findOne({ email });
      if (!storedOtp) return res.status(400).json({ message: 'OTP_NOT_REQUESTED_OR_EXPIRED' });
      
      if (storedOtp.attempts >= 5) {
        await Otp.deleteOne({ email });
        return res.status(429).json({ message: 'OTP_MAX_ATTEMPTS_EXCEEDED' });
      }

      if (storedOtp.otp !== otp) {
        storedOtp.attempts += 1;
        await storedOtp.save();
        return res.status(400).json({ message: 'INVALID_OTP' });
      }

      // Valid OTP
      await Otp.deleteOne({ email });
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
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        maintenanceAmount: Number(maintenanceAmount) || 0,
      });
      assignedSocietyId = newSociety._id;
    }
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      societyId: assignedSocietyId
    });

    await Society.findByIdAndUpdate(assignedSocietyId, { createdBy: user._id });

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

    if (password.length < 8) {
      return res.status(400).json({ message: 'PASSWORD_MIN_8_CHARS' });
    }
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number.' });
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

    // Notify Admins
    const admins = await User.find({ societyId, role: 'admin' });
    admins.forEach(admin => {
      const html = getProfessionalEmailTemplate({
        subtitle: 'NEW REGISTRATION REQUEST',
        greeting: 'Hello Admin,',
        bodyText: `A new member (<strong>${name}</strong>) has registered for Flat <strong>${wing}-${flatNumber}</strong>. Please log in to the admin dashboard to review and approve or decline their request.`,
        footerText: 'This is an automated system notification.'
      });

      sendEmail({
        email: admin.email,
        subject: 'New Member Registration Request',
        message: `A new member (${name}) has registered for Flat ${wing}-${flatNumber}. Please approve or decline their request.`,
        html
      });
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

    let user = await User.findOne({ email });
    let isSecurity = false;

    if (!user) {
      user = await SecurityStaff.findOne({ email });
      if (user) isSecurity = true;
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'CREDENTIALS_REJECTED' });
    }

    // Block inactive (pending approval) accounts
    if (user.isActive === false && !isSecurity) {
      return res.status(403).json({ message: 'ACCOUNT_PENDING_APPROVAL — Contact your society admin.' });
    }

    await user.populate('societyId', 'name city maintenanceAmount isActive');

    if (user.societyId && user.societyId.isActive === false) {
      return res.status(403).json({ message: 'SOCIETY_SUSPENDED — Please contact platform administrator.' });
    }

    if (isSecurity) {
      await AuditLog.create({
        action: 'Security Login',
        performedBy: user._id,
        targetModel: 'SecurityStaff',
        details: { societyId: user.societyId?._id },
        ipAddress: req.ip,
        status: 'Success'
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, societyId: user.societyId?._id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
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
        mustChangePassword: user.mustChangePassword,
        isSecurity
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

    let user = await User.findById(req.user._id);
    if (!user) {
      user = await SecurityStaff.findById(req.user._id);
    }
    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND' });

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    
    // Only update parkingSlot and vehicleNumber for regular members
    if (user.role !== 'security' && user.role !== 'superadmin') {
      if (parkingSlot !== undefined) user.parkingSlot = parkingSlot;
      if (vehicleNumber !== undefined) user.vehicleNumber = vehicleNumber;
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'CURRENT_PASSWORD_REQUIRED' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'CURRENT_PASSWORD_INCORRECT' });
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'PASSWORD_MIN_8_CHARS' });
      }
      const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!strongPassword.test(newPassword)) {
        return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number.' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.mustChangePassword = false;
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
    const users = await User.find({ societyId: req.user.societyId, role: 'member', isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('// GET_USERS_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 5B. GET SECURITY STAFF (Admin) ───────────────────────────────────────────
const getSecurityStaff = async (req, res) => {
  try {
    const staff = await SecurityStaff.find({ societyId: req.user.societyId })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    console.error('// GET_STAFF_FAULT:', error);
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

    const adminUser = await User.findById(req.user._id).populate('societyId');
    const societyName = adminUser.societyId?.name || 'Awaastech Society';
    const adminName = adminUser.name;
    const adminEmail = adminUser.email;

    // Notify User
    const html = getProfessionalEmailTemplate({
      subtitle: `ACCOUNT APPROVED - ${societyName.toUpperCase()}`,
      greeting: `Hello ${user.name},`,
      bodyText: `Great news! Your registration for <strong>${societyName}</strong> has been approved by the society admin (<strong>${adminName}</strong> - <a href="mailto:${adminEmail}">${adminEmail}</a>). You can now log in to the member portal to view bills, notices, and submit complaints.`,
      highlightBox: 'APPROVED',
      highlightBoxLabel: 'Account Status',
      footerText: `Welcome to ${societyName}.`
    });

    sendEmail({
      email: user.email,
      subject: 'Society Registration Approved',
      message: `Hello ${user.name},\n\nYour registration has been approved. You can now log in to the portal.`,
      html
    });

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
    const { name, email, wing, floor, flatNumber, residentType, phone, role, age, address, joinDate, shift } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'NAME_AND_EMAIL_REQUIRED' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'USER_IDENT_ALREADY_EXISTS' });

    // Generate password based on first name and 4 random digits
    const firstName = name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    const randomNums = Math.floor(1000 + Math.random() * 9000);
    const generatedPassword = `${firstName}@${randomNums}`;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    let userData = {
      name, email,
      password: hashedPassword,
      role: role && role === 'security' ? 'security' : 'member',
      societyId: req.user.societyId,
      phone,
      isActive: true,
      mustChangePassword: true,
      flatDetails: { wing, floor: Number(floor), flatNumber, residentType: residentType || 'Owner' }
    };

    if (role === 'security') {
      userData.securityDetails = {
        age: age ? Number(age) : undefined,
        address: address || '',
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        shift: shift || 'Day',
        status: 'Active'
      };
    }

    const user = await User.create(userData);

    const adminUser = await User.findById(req.user._id).populate('societyId');
    const societyName = adminUser.societyId?.name || 'Awaastech Society';
    const adminName = adminUser.name;
    const adminEmail = adminUser.email;

    // Notify User with credentials
    const html = getProfessionalEmailTemplate({
      subtitle: `WELCOME TO ${societyName.toUpperCase()}`,
      greeting: `Hello ${user.name},`,
      bodyText: `An account has been created for you by your society admin (<strong>${adminName}</strong>). Please use the following temporary credentials to log in. <strong>You must change your password immediately after logging in.</strong><br><br>If you have any questions, contact your admin at <a href="mailto:${adminEmail}">${adminEmail}</a>.`,
      highlightBox: `${user.email}<br><span style="font-size: 20px;">Pass: ${generatedPassword}</span>`,
      highlightBoxLabel: 'Your Login Credentials',
      warningText: 'Do not share this password with anyone.',
      footerText: `Sent on behalf of ${societyName}`
    });

    sendEmail({
      email: user.email,
      subject: 'Welcome to the Society Management System',
      message: `Hello ${user.name},\n\nLogin Email: ${user.email}\nTemporary Password: ${generatedPassword}\n\nPlease log in and change your password immediately.`,
      html
    });

    res.status(201).json({ 
      message: 'MEMBER_ADDED_TO_REGISTRY',
      generatedPassword
    });
  } catch (error) {
    console.error('// ADD_MEMBER_FAULT:', error);
    res.status(500).json({ message: error.message || 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 10B. ADD SECURITY STAFF (Admin) ──────────────────────────────────────────
const addSecurityStaff = async (req, res) => {
  try {
    const { name, email, phone, age, address, joinDate, shift } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'NAME_AND_EMAIL_REQUIRED' });
    }

    const userExists = await User.findOne({ email });
    const staffExists = await SecurityStaff.findOne({ email });
    if (userExists || staffExists) return res.status(400).json({ message: 'EMAIL_ALREADY_IN_USE' });

    const firstName = name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    const randomNums = Math.floor(1000 + Math.random() * 9000);
    const generatedPassword = `${firstName}@${randomNums}`;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    const staff = await SecurityStaff.create({
      name, email, phone, age, address, shift, joinDate,
      password: hashedPassword,
      societyId: req.user.societyId,
    });

    const adminUser = await User.findById(req.user._id).populate('societyId');
    const societyName = adminUser.societyId?.name || 'Awaastech Society';

    const html = getProfessionalEmailTemplate({
      subtitle: `SECURITY ONBOARDING - ${societyName.toUpperCase()}`,
      greeting: `Hello ${staff.name},`,
      bodyText: `Your security staff account has been created by the administrator. Use the credentials below to log into the security portal. <strong>You must change your password immediately.</strong>`,
      highlightBox: `${staff.email}<br><span style="font-size: 20px;">Pass: ${generatedPassword}</span>`,
      highlightBoxLabel: 'Your Login Credentials',
      warningText: 'Do not share this password with anyone.',
    });

    sendEmail({
      email: staff.email,
      subject: 'Welcome to Security Portal',
      message: `Login Email: ${staff.email}\nTemporary Password: ${generatedPassword}`,
      html
    });

    res.status(201).json({ message: 'SECURITY_STAFF_ADDED', generatedPassword });
  } catch (error) {
    console.error('// ADD_SECURITY_FAULT:', error);
    res.status(500).json({ message: error.message || 'INTERNAL_SERVER_ERROR' });
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
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'EMAIL_ALREADY_IN_USE' });
      user.email = email;
    }
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
    res.status(500).json({ message: error.message || 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 11B. UPDATE SECURITY STAFF (Admin) ───────────────────────────────────────
const updateSecurityStaff = async (req, res) => {
  try {
    const { name, phone, age, address, shift } = req.body;
    const staff = await SecurityStaff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'STAFF_NOT_FOUND' });

    if (staff.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'AUTH_DOMAIN_MISMATCH' });
    }

    if (name) staff.name = name;
    if (phone) staff.phone = phone;
    if (age) staff.age = Number(age);
    if (address) staff.address = address;
    if (shift) staff.shift = shift;

    await staff.save();
    res.json({ message: 'STAFF_UPDATED', staff });
  } catch (error) {
    console.error('// UPDATE_STAFF_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 11C. TERMINATE SECURITY STAFF (Admin) ────────────────────────────────────
const terminateSecurityStaff = async (req, res) => {
  try {
    const staff = await SecurityStaff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'STAFF_NOT_FOUND' });

    if (staff.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'AUTH_DOMAIN_MISMATCH' });
    }

    staff.status = 'Left';
    staff.leaveDate = new Date();
    staff.isActive = false; // Revoke login access

    await staff.save();
    res.json({ message: 'STAFF_TERMINATED', staff });
  } catch (error) {
    console.error('// TERMINATE_STAFF_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 12. SOCIETY LIMITS ───────────────────────────────────────────────────────
const getSocietyLimits = async (req, res) => {
  try {
    const society = await Society.findById(req.user.societyId);
    if (!society) return res.status(404).json({ message: 'DOMAIN_NOT_FOUND' });
    res.json({ wings: society.wings, floors: society.floors });
  } catch (error) {
    console.error('// GET_LIMITS_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const seedSuperAdmin = async (req, res) => {
  try {
    const { email, password, secretCode } = req.body;
    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(403).json({ message: 'Invalid admin secret code' });
    }
    let user = await User.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    if (!user) {
      user = await User.create({
        name: 'Super Admin',
        email,
        password: hashedPassword,
        role: 'superadmin'
      });
    } else {
      user.role = 'superadmin';
      user.password = hashedPassword;
      await user.save();
    }
    res.json({ message: 'Superadmin access granted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 13. FORGOT PASSWORD ────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'EMAIL_REQUIRED' });

    let user = await User.findOne({ email });
    if (!user) {
      user = await SecurityStaff.findOne({ email });
    }
    
    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // --- DEV MODE HELPER: Print OTP to console since email might fail ---
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n=========================================`);
      console.log(`🔑 DEV MODE PASSWORD RESET OTP FOR ${email}: ${otp}`);
      console.log(`=========================================\n`);
    }

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    const html = getProfessionalEmailTemplate({
      subtitle: 'PASSWORD RECOVERY PROTOCOL',
      greeting: `Hello ${user.name},`,
      bodyText: 'We received a request to reset your password. Use the verification code below to authorize the password reset process.',
      highlightBox: otp,
      highlightBoxLabel: 'Verification Code',
      warningText: 'This code expires in exactly 120 seconds.',
    });

    await sendEmail({
      email,
      subject: 'Awaastech Society - Password Reset Code',
      message: `Your password reset code is: ${otp}\n\nThis code expires in 120 seconds.`,
      html
    });

    res.json({ message: 'OTP_SENT_SUCCESSFULLY' });
  } catch (error) {
    console.error('// FORGOT_PASSWORD_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 14. RESET PASSWORD ───────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'ALL_FIELDS_REQUIRED' });
    }

    const storedOtp = await Otp.findOne({ email });
    if (!storedOtp) return res.status(400).json({ message: 'OTP_NOT_REQUESTED_OR_EXPIRED' });

    if (storedOtp.attempts >= 5) {
      await Otp.deleteOne({ email });
      return res.status(429).json({ message: 'OTP_MAX_ATTEMPTS_EXCEEDED' });
    }

    if (storedOtp.otp !== otp) {
      storedOtp.attempts += 1;
      await storedOtp.save();
      return res.status(400).json({ message: 'INVALID_OTP' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'PASSWORD_MIN_8_CHARS' });
    }
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPassword.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number.' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await SecurityStaff.findOne({ email });
    }
    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
    await user.save();

    await Otp.deleteOne({ email });

    res.json({ message: 'PASSWORD_RESET_SUCCESSFULLY' });
  } catch (error) {
    console.error('// RESET_PASSWORD_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 15. LOGOUT (Optional for audit logging) ──────────────────────────────────
const logoutUser = async (req, res) => {
  try {
    if (req.user && req.user.role === 'security') {
      await AuditLog.create({
        action: 'Security Logout',
        performedBy: req.user._id,
        targetModel: 'SecurityStaff',
        details: { societyId: req.user.societyId },
        ipAddress: req.ip,
        status: 'Success'
      });
    }
    res.json({ message: 'LOGGED_OUT' });
  } catch (error) {
    console.error('// LOGOUT_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// ─── 16. GET SECURITY LOGS (Admin) ────────────────────────────────────────────
const getSecurityLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({
      'details.societyId': req.user.societyId,
      targetModel: 'SecurityStaff',
      action: { $in: ['Security Login', 'Security Logout'] }
    })
    .populate('performedBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(100);
    
    res.json(logs);
  } catch (error) {
    console.error('// GET_SEC_LOGS_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = {
  sendOTP, verifyOTP,
  registerUser, loginUser, updateProfile,
  getAllUsers, getSecurityStaff, getPendingMembers, deleteUser, addMember, addSecurityStaff, updateMember, updateSecurityStaff, terminateSecurityStaff, getSocietyLimits, approveMember, seedSuperAdmin,
  forgotPassword, resetPassword, logoutUser, getSecurityLogs
};