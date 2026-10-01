import User from '../models/User';
import SecurityStaff from '../models/SecurityStaff';
import Otp from '../models/Otp';
import AuditLog from '../models/AuditLog';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { emailQueue } from '../workers/emailQueue';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import getRedis from '../utils/redis';
import logger from '../utils/logger';

const redisClient = getRedis();

// ── Token Helpers ──────────────────────────────────────────────────────────────

const ACCESS_TOKEN_TTL  = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TTL_SECS  = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generate a short-lived access token and a long-lived refresh token.
 * The refresh token is stored (hashed) in Redis to enable server-side revocation.
 */
export const generateTokens = async (
  userId: string,
  role: string,
  societyId: string | undefined,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const jwtSecret = (process.env.JWT_SECRET || 'ci_jwt_super_secret_test_key_12345') as string;
  const jwtRefreshSecret = (process.env.JWT_REFRESH_SECRET || jwtSecret) as string;

  const accessToken = jwt.sign(
    { id: userId, role, societyId },
    jwtSecret,
    { expiresIn: ACCESS_TOKEN_TTL },
  );

  const refreshToken = jwt.sign(
    { id: userId, role, societyId },
    jwtRefreshSecret,
    { expiresIn: REFRESH_TOKEN_TTL },
  );

  // Store a hash of the refresh token in Redis so we can invalidate it on logout.
  // Guard with status check — same pattern as the rest of the codebase — so the
  // app degrades gracefully when Redis is offline (e.g. in local dev / test env).
  if (redisClient && redisClient.status === 'ready') {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await redisClient.set(`rt_${userId}`, tokenHash, 'EX', REFRESH_TTL_SECS);
  }

  return { accessToken, refreshToken };
};

/**
 * Validate a refresh token and issue a fresh token pair (rotation pattern).
 * Invalidates the old refresh token immediately after verification.
 */
export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  let decoded: { id: string; role: string; societyId?: string };
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as { id: string; role: string; societyId?: string };
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // Verify the stored hash matches — rejects tokens revoked on logout.
  // If Redis is offline we skip the hash check (tokens still expire by JWT TTL).
  if (redisClient && redisClient.status === 'ready') {
    const stored = await redisClient.get(`rt_${decoded.id}`);
    if (!stored) throw new Error('REFRESH_TOKEN_REVOKED');
    const incoming = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (stored !== incoming) throw new Error('REFRESH_TOKEN_REVOKED');
  }

  // Rotate: delete the old token and issue a new pair
  if (redisClient && redisClient.status === 'ready') await redisClient.del(`rt_${decoded.id}`);
  return generateTokens(decoded.id, decoded.role, decoded.societyId);
};

export const login = async (email: string, password: string, ip: string) => {
  // select('+password') is needed because password has select:false in schema
  let user = await User.findOne({ email }).select('+password');
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

  const { accessToken, refreshToken } = await generateTokens(
    String(user._id),
    user.role,
    String((user.societyId as any)?._id),
  );

  return { user, isSecurity, accessToken, refreshToken };
};

export const getMe = async (userId: string) => {
  let user = await User.findById(userId).select('-password').populate('societyId', 'name city maintenanceAmount');
  if (!user) {
    user = (await SecurityStaff.findById(userId).select('-password').populate('societyId', 'name city')) as any;
  }
  return user;
};

export const forgotPassword = async (email: string) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = (await SecurityStaff.findOne({ email: normalizedEmail })) as any;
  }

  // SECURITY: Silently return if user not found — never reveal if an email exists in the system.
  // The controller always returns 200 to prevent email enumeration attacks.
  if (!user) return;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (process.env.NODE_ENV !== 'production') {
    logger.info(`🔑 DEV MODE PASSWORD RESET OTP FOR ${normalizedEmail}: ${otp}`);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp, salt);
  await Otp.deleteMany({ email: normalizedEmail });
  await Otp.create({ email: normalizedEmail, otp: hashedOtp, isVerified: false });

  const html = getProfessionalEmailTemplate({
    subtitle: 'PASSWORD RECOVERY PROTOCOL',
    greeting: `Hello ${user.name},`,
    bodyText: 'We received a request to reset your password. Use the verification code below to authorize the password reset process.',
    highlightBox: otp,
    highlightBoxLabel: 'Verification Code',
    warningText: 'This code expires in 10 minutes.',
  });

  await emailQueue.add('sendEmailJob', {
    email: normalizedEmail,
    subject: 'Awaastech Society - Password Reset Code',
    message: `Your password reset code is: ${otp}\n\nThis code expires in 10 minutes.`,
    html
  });
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const storedOtp = await Otp.findOne({ email: normalizedEmail });
  if (!storedOtp) throw new Error('OTP_NOT_REQUESTED_OR_EXPIRED');

  if (storedOtp.attempts >= 5) {
    await Otp.deleteMany({ email: normalizedEmail });
    throw new Error('OTP_MAX_ATTEMPTS_EXCEEDED');
  }

  const isMatch = await bcrypt.compare(String(otp).trim(), storedOtp.otp);
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

  // select('+password') because password has select:false in schema
  let user = await User.findOne({ email }).select('+password');
  if (!user) {
    user = (await SecurityStaff.findOne({ email }).select('+password')) as any;
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
    // Blacklist the access token for its remaining TTL
    const decoded: any = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await redisClient.set(`bl_${token}`, 'revoked', 'EX', expiresIn);
      }
    }
    // Revoke the refresh token as well (delete the stored hash)
    if (decoded && decoded.id && redisClient.status === 'ready') {
      await redisClient.del(`rt_${decoded.id}`);
    }
  }
};
