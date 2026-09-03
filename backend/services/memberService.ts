import User from '../models/User';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/sendEmail';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import logger from '../utils/logger';

export const getAllUsers = async (user: any) => {
  return await User.find({ societyId: user.societyId, role: 'member', isActive: true })
    .select('-password')
    .sort({ createdAt: -1 });
};

export const getPendingMembers = async (user: any) => {
  return await User.find({
    societyId: user.societyId, role: 'member', isActive: false
  }).select('-password');
};

export const approveMember = async (memberId: string, admin: any) => {
  const user = await User.findById(memberId);
  if (!user) throw new Error('USER_NOT_FOUND');

  if (user.societyId?.toString() !== admin.societyId.toString()) {
    throw new Error('FORBIDDEN');
  }

  user.isActive = true;
  await user.save();

  const adminId = admin._id || admin.id;
  const adminUser = await User.findById(adminId).populate('societyId');
  const societyName = (adminUser?.societyId as any)?.name || 'Awaastech Society';
  const adminName = adminUser?.name || 'Society Admin';
  const adminEmail = adminUser?.email || 'admin@awaastech.com';

  const html = getProfessionalEmailTemplate({
    subtitle: `ACCOUNT APPROVED - ${societyName.toUpperCase()}`,
    greeting: `Hello ${user.name},`,
    bodyText: `Great news! Your registration for <strong>${societyName}</strong> has been approved by the society admin (<strong>${adminName}</strong> - <a href="mailto:${adminEmail}">${adminEmail}</a>). You can now log in to the member portal to view bills, notices, and submit complaints.`,
    highlightBox: 'APPROVED',
    highlightBoxLabel: 'Account Status',
    footerText: `Welcome to ${societyName}.`
  });

  try {
    await sendEmail({
      email: user.email,
      subject: 'Society Registration Approved',
      message: `Hello ${user.name},\n\nYour registration has been approved. You can now log in to the portal.`,
      html
    });
    logger.info(`// MEMBER_APPROVAL_EMAIL_SENT: ${user.email}`);
  } catch (emailErr: any) {
    logger.error('// MEMBER_APPROVAL_EMAIL_FAULT:', emailErr.message);
  }

  return user;
};

export const deleteUser = async (memberId: string, admin: any) => {
  const userToDelete = await User.findById(memberId);
  if (!userToDelete) throw new Error('USER_NOT_FOUND');

  if (userToDelete.societyId?.toString() !== admin.societyId.toString()) {
    throw new Error('AUTH_DOMAIN_MISMATCH');
  }

  userToDelete.deletedAt = new Date();
  await userToDelete.save();
  return userToDelete;
};

export const addMember = async (data: any, admin: any) => {
  const { name, email, wing, floor, flatNumber, residentType, phone, role, age, address, joinDate, shift } = data;

  if (!name || !email) {
    throw new Error('NAME_AND_EMAIL_REQUIRED');
  }

  const userExists = await User.findOne({ email });
  if (userExists) throw new Error('USER_IDENT_ALREADY_EXISTS');

  const firstName = name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
  const randomNums = Math.floor(1000 + Math.random() * 9000);
  const generatedPassword = `${firstName}@${randomNums}`;
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(generatedPassword, salt);

  let userData: any = {
    name, email,
    password: hashedPassword,
    role: role && role === 'security' ? 'security' : 'member',
    societyId: admin.societyId,
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

  const adminId = admin._id || admin.id;
  const adminUser = await User.findById(adminId).populate('societyId');
  const societyName = (adminUser?.societyId as any)?.name || 'Awaastech Society';
  const adminName = adminUser?.name || 'Society Admin';
  const adminEmail = adminUser?.email || 'admin@awaastech.com';

  const html = getProfessionalEmailTemplate({
    subtitle: `WELCOME TO ${societyName.toUpperCase()}`,
    greeting: `Hello ${user.name},`,
    bodyText: `An account has been created for you by your society admin (<strong>${adminName}</strong>). Please use the following temporary credentials to log in. <strong>You must change your password immediately after logging in.</strong><br><br>If you have any questions, contact your admin at <a href="mailto:${adminEmail}">${adminEmail}</a>.`,
    highlightBox: `${user.email}<br><span style="font-size: 20px;">Pass: ${generatedPassword}</span>`,
    highlightBoxLabel: 'Your Login Credentials',
    warningText: 'Do not share this password with anyone.',
    footerText: `Sent on behalf of ${societyName}`
  });

  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to the Society Management System',
      message: `Hello ${user.name},\n\nLogin Email: ${user.email}\nTemporary Password: ${generatedPassword}\n\nPlease log in and change your password immediately.`,
      html
    });
    logger.info(`// MEMBER_WELCOME_EMAIL_SENT: ${user.email}`);
  } catch (emailErr: any) {
    logger.error('// MEMBER_WELCOME_EMAIL_FAULT:', emailErr.message);
  }

  return { user, generatedPassword };
};

export const updateMember = async (memberId: string, data: any, admin: any) => {
  const { name, email, wing, floor, flatNumber, residentType, phone, parkingSlot, vehicleNumber } = data;

  const user = await User.findById(memberId);
  if (!user) throw new Error('RECORD_NOT_FOUND');

  if (user.societyId?.toString() !== admin.societyId.toString()) {
    throw new Error('AUTH_DOMAIN_MISMATCH');
  }

  if (name) user.name = name;
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) throw new Error('EMAIL_ALREADY_IN_USE');
    user.email = email;
  }
  if (phone !== undefined) user.phone = phone;
  if (parkingSlot !== undefined) user.parkingSlot = parkingSlot;
  if (vehicleNumber !== undefined) user.vehicleNumber = vehicleNumber;

  if (!user.flatDetails) user.flatDetails = { residentType: residentType || 'Owner' };
  if (wing) user.flatDetails.wing = wing;
  if (floor !== undefined) user.flatDetails.floor = Number(floor);
  if (flatNumber) user.flatDetails.flatNumber = flatNumber;
  if (residentType) user.flatDetails.residentType = residentType;

  await user.save();
  const { password: _, ...safeUser } = user.toObject();
  return safeUser;
};
