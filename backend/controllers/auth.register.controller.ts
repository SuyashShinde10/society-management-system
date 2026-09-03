import { Request, Response } from 'express';
import User from '../models/User';
import Society from '../models/Society';
import Otp from '../models/Otp';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/sendEmail';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import logger from '../utils/logger';

export const registerUser = async (req: Request, res: Response) => {
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

      const isMatch = await bcrypt.compare(otp, storedOtp.otp);
      if (!isMatch) {
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
    logger.error('// REGISTER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_REGISTRY_ERROR' });
  }
};

export const memberSelfRegister = async (req: Request, res: Response) => {
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
    await Promise.allSettled(
      admins.map(admin => {
        const html = getProfessionalEmailTemplate({
          subtitle: 'NEW REGISTRATION REQUEST',
          greeting: 'Hello Admin,',
          bodyText: `A new member (<strong>${name}</strong>) has registered for Flat <strong>${wing}-${flatNumber}</strong>. Please log in to the admin dashboard to review and approve or decline their request.`,
          footerText: 'This is an automated system notification.'
        });

        return sendEmail({
          email: admin.email,
          subject: 'New Member Registration Request',
          message: `A new member (${name}) has registered for Flat ${wing}-${flatNumber}. Please approve or decline their request.`,
          html
        });
      })
    );

    res.status(201).json({ message: 'REGISTRATION_PENDING_ADMIN_APPROVAL' });
  } catch (error) {
    logger.error('// MEMBER_SELF_REGISTER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
