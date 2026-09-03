import User from '../models/User';
import SecurityStaff from '../models/SecurityStaff';
import Otp from '../models/Otp';
import AuditLog from '../models/AuditLog';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { emailQueue } from '../workers/emailQueue';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import getRedis from '../utils/redis';
import logger from '../utils/logger';

const redisClient = getRedis();

export const login = async (email: string, password: string, ip: string) => {
  let user = await User.findOne({ email });
  let isSecurity = false;

  if (!user) {
    user = (await SecurityStaff.findOne({ email })) as any;
    if (user) isSecurity = true;
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('CREDENTIALS_REJECTED');
  }

  if (user.isActive === false && !isSecurity) {
    throw new Error('ACCOUNT_PENDING_APPROVAL');
  }

  await user.populate('societyId', 'name city maintenanceAmount isActive');

  if (user.societyId && (user.societyId as any).isActive === false) {
    throw new Error('SOCIETY_SUSPENDED');
  }

  if (isSecurity) {
    await AuditLog.create({
      action: 'Security Login',
      performedBy: user._id,
      targetModel: 'SecurityStaff',
      details: { societyId: (user.societyId as any)?._id },
      ipAddress: ip,
      status: 'Success'
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, societyId: (user.societyId as any)?._id },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  return { user, isSecurity, token };
};

export const getMe = async (userId: string) => {
  let user = await User.findById(userId).select('-password').populate('societyId', 'name city maintenanceAmount');
  if (!user) {
    user = (await SecurityStaff.findById(userId).select('-password').populate('societyId', 'name city')) as any;
  }
  return user;
};

export const forgotPassword = async (email: string) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = (await SecurityStaff.findOne({ email })) as any;
  }
  
  if (!user) throw new Error('USER_NOT_FOUND');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (process.env.NODE_ENV !== 'production') {
    logger.info(`🔑 DEV MODE PASSWORD RESET OTP FOR ${email}: ${otp}`);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp, salt);
  await Otp.deleteMany({ email });
  await Otp.create({ email, otp: hashedOtp });

  const html = getProfessionalEmailTemplate({
    subtitle: 'PASSWORD RECOVERY PROTOCOL',
    greeting: `Hello ${user.name},`,
    bodyText: 'We received a request to reset your password. Use the verification code below to authorize the password reset process.',
    highlightBox: otp,
    highlightBoxLabel: 'Verification Code',
    warningText: 'This code expires in exactly 120 seconds.',
  });

  await emailQueue.add('sendEmailJob', {
    email,
    subject: 'Awaastech Society - Password Reset Code',
    message: `Your password reset code is: ${otp}\n\nThis code expires in 120 seconds.`,
    html
  });
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const storedOtp = await Otp.findOne({ email });
  if (!storedOtp) throw new Error('OTP_NOT_REQUESTED_OR_EXPIRED');

  if (storedOtp.attempts >= 5) {
    await Otp.deleteOne({ email });
    throw new Error('OTP_MAX_ATTEMPTS_EXCEEDED');
  }

  const isMatch = await bcrypt.compare(otp, storedOtp.otp);
  if (!isMatch) {
    storedOtp.attempts += 1;
    await storedOtp.save();
    throw new Error('INVALID_OTP');
  }

  if (newPassword.length < 8) {
    throw new Error('PASSWORD_MIN_8_CHARS');
  }
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!strongPassword.test(newPassword)) {
    throw new Error('WEAK_PASSWORD');
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = (await SecurityStaff.findOne({ email })) as any;
  }
  if (!user) throw new Error('USER_NOT_FOUND');

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.mustChangePassword = false;
  await user.save();

  await Otp.deleteOne({ email });
};

export const logout = async (user: any, token: string, ip: string) => {
  if (user && user.role === 'security') {
    await AuditLog.create({
      action: 'Security Logout',
      performedBy: user._id,
      targetModel: 'SecurityStaff',
      details: { societyId: user.societyId },
      ipAddress: ip,
      status: 'Success'
    });
  }
  
  if (token && redisClient) {
    const decoded: any = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await redisClient.set(`bl_${token}`, 'revoked', 'EX', expiresIn);
      }
    }
  }
};
