import { Request, Response } from 'express';
import Otp from '../models/Otp';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/sendEmail';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import logger from '../utils/logger';

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email, societyName, adminName, adminEmail } = req.body;
    if (!email) return res.status(400).json({ message: 'EMAIL_REQUIRED' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`\n=========================================`);
      logger.info(`🔑 DEV MODE OTP FOR ${email}: ${otp}`);
      logger.info(`=========================================\n`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: hashedOtp });

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
    logger.error('// SEND_OTP_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
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

    res.json({ success: true, message: 'EMAIL_VERIFIED' });
  } catch (error) {
    logger.error('// VERIFY_OTP_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
