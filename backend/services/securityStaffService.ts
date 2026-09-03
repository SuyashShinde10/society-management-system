import User from '../models/User';
import SecurityStaff from '../models/SecurityStaff';
import AuditLog from '../models/AuditLog';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/sendEmail';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import logger from '../utils/logger';

export const getSecurityStaff = async (admin: any) => {
  return await SecurityStaff.find({ societyId: admin.societyId })
    .select('-password')
    .sort({ createdAt: -1 });
};

export const addSecurityStaff = async (data: any, admin: any) => {
  const { name, email, phone, age, address, joinDate, shift } = data;

  if (!name || !email) {
    throw new Error('NAME_AND_EMAIL_REQUIRED');
  }

  const userExists = await User.findOne({ email });
  const staffExists = await SecurityStaff.findOne({ email });
  if (userExists || staffExists) throw new Error('EMAIL_ALREADY_IN_USE');

  const firstName = name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
  const randomNums = Math.floor(1000 + Math.random() * 9000);
  const generatedPassword = `${firstName}@${randomNums}`;
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(generatedPassword, salt);

  const staff = await SecurityStaff.create({
    name, email, phone, age, address, shift, joinDate,
    password: hashedPassword,
    societyId: admin.societyId,
  });

  const adminUser = await User.findById(admin._id).populate('societyId');
  const societyName = (adminUser?.societyId as any)?.name || 'Awaastech Society';

  const html = getProfessionalEmailTemplate({
    subtitle: `SECURITY ONBOARDING - ${societyName.toUpperCase()}`,
    greeting: `Hello ${staff.name},`,
    bodyText: `Your security staff account has been created by the administrator. Use the credentials below to log into the security portal. <strong>You must change your password immediately.</strong>`,
    highlightBox: `${staff.email}<br><span style="font-size: 20px;">Pass: ${generatedPassword}</span>`,
    highlightBoxLabel: 'Your Login Credentials',
    warningText: 'Do not share this password with anyone.',
  });

  try {
    await sendEmail({
      email: staff.email,
      subject: 'Welcome to Security Portal',
      message: `Login Email: ${staff.email}\nTemporary Password: ${generatedPassword}`,
      html
    });
    logger.info(`// SECURITY_STAFF_WELCOME_SENT: ${staff.email}`);
  } catch (emailErr: any) {
    logger.error('// SECURITY_STAFF_WELCOME_FAULT:', emailErr.message);
  }

  return { staff, generatedPassword };
};

export const updateSecurityStaff = async (staffId: string, data: any, admin: any) => {
  const { name, phone, age, address, shift } = data;
  const staff = await SecurityStaff.findById(staffId);
  if (!staff) throw new Error('STAFF_NOT_FOUND');

  if (staff.societyId?.toString() !== admin.societyId.toString()) {
    throw new Error('AUTH_DOMAIN_MISMATCH');
  }

  if (name) staff.name = name;
  if (phone) staff.phone = phone;
  if (age) staff.age = Number(age);
  if (address) staff.address = address;
  if (shift) staff.shift = shift;

  await staff.save();
  return staff;
};

export const terminateSecurityStaff = async (staffId: string, admin: any) => {
  const staff = await SecurityStaff.findById(staffId);
  if (!staff) throw new Error('STAFF_NOT_FOUND');

  if (staff.societyId?.toString() !== admin.societyId.toString()) {
    throw new Error('AUTH_DOMAIN_MISMATCH');
  }

  staff.status = 'Left';
  staff.leaveDate = new Date();
  staff.isActive = false;

  await staff.save();
  return staff;
};

export const getSecurityLogs = async (admin: any) => {
  return await AuditLog.find({
    'details.societyId': admin.societyId,
    targetModel: 'SecurityStaff',
    action: { $in: ['Security Login', 'Security Logout'] }
  })
  .populate('performedBy', 'name email role')
  .sort({ createdAt: -1 })
  .limit(100);
};
