import { Request, Response } from 'express';
import * as authService from '../services/authService';
import logger from '../utils/logger';

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'EMAIL_AND_PASSWORD_REQUIRED' });
    }

    const { user, isSecurity, token } = await authService.login(email, password, req.ip);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000
    });

    res.json({
      token,
      user: {
        id: (user as any)._id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role,
        phone: (user as any).phone,
        societyId: (user as any).societyId?._id,
        societyName: (user as any).societyId?.name || 'UNLINKED',
        societyCity: (user as any).societyId?.city || '',
        flatDetails: (user as any).flatDetails,
        parkingSlot: (user as any).parkingSlot,
        vehicleNumber: (user as any).vehicleNumber,
        mustChangePassword: (user as any).mustChangePassword,
        isSecurity
      }
    });
  } catch (error: any) {
    logger.error('// LOGIN_FAULT:', error);
    if (['CREDENTIALS_REJECTED', 'ACCOUNT_PENDING_APPROVAL', 'SOCIETY_SUSPENDED'].includes(error.message)) {
      return res.status(error.message === 'CREDENTIALS_REJECTED' ? 401 : 403).json({ 
        message: error.message.includes('APPROVAL') ? 'ACCOUNT_PENDING_APPROVAL — Contact your society admin.' 
               : error.message.includes('SUSPENDED') ? 'SOCIETY_SUSPENDED — Please contact platform administrator.' 
               : 'CREDENTIALS_REJECTED' 
      });
    }
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await authService.getMe((req as any).user.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    res.json({ user });
  } catch (error) {
    logger.error('// GET_ME_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'EMAIL_REQUIRED' });

    await authService.forgotPassword(email);

    res.json({ message: 'OTP_SENT_SUCCESSFULLY' });
  } catch (error: any) {
    logger.error('// FORGOT_PASSWORD_FAULT:', error);
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'USER_NOT_FOUND' });
    }
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'ALL_FIELDS_REQUIRED' });
    }

    await authService.resetPassword(email, otp, newPassword);

    res.json({ message: 'PASSWORD_RESET_SUCCESSFULLY' });
  } catch (error: any) {
    logger.error('// RESET_PASSWORD_FAULT:', error);
    const knownErrors: { [key: string]: number } = {
      'OTP_NOT_REQUESTED_OR_EXPIRED': 400,
      'OTP_MAX_ATTEMPTS_EXCEEDED': 429,
      'INVALID_OTP': 400,
      'PASSWORD_MIN_8_CHARS': 400,
      'WEAK_PASSWORD': 400,
      'USER_NOT_FOUND': 404
    };
    if (error.message && knownErrors[error.message]) {
      const msg = error.message === 'WEAK_PASSWORD' 
        ? 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number.'
        : error.message;
      return res.status(knownErrors[error.message]).json({ message: msg });
    }
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    await authService.logout((req as any).user, token, req.ip);

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ message: 'LOGGED_OUT' });
  } catch (error) {
    logger.error('// LOGOUT_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
