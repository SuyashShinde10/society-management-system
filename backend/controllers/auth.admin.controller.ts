import { Request, Response } from 'express';
import * as authAdminService from '../services/authAdminService';
import logger from '../utils/logger';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const safeUser = await authAdminService.updateProfile((req as any).user._id, req.body);
    res.json({ message: 'PROFILE_UPDATED', user: safeUser });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'USER_NOT_FOUND' });
    if (error.message === 'CURRENT_PASSWORD_REQUIRED') return res.status(400).json({ message: 'CURRENT_PASSWORD_REQUIRED' });
    if (error.message === 'CURRENT_PASSWORD_INCORRECT') return res.status(400).json({ message: 'CURRENT_PASSWORD_INCORRECT' });
    if (error.message === 'PASSWORD_MIN_8_CHARS') return res.status(400).json({ message: 'PASSWORD_MIN_8_CHARS' });
    if (error.message === 'PASSWORD_NOT_STRONG') return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number.' });
    
    logger.error('// UPDATE_PROFILE_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getSocietyLimits = async (req: Request, res: Response) => {
  try {
    const limits = await authAdminService.getSocietyLimits((req as any).user.societyId);
    res.json(limits);
  } catch (error: any) {
    if (error.message === 'DOMAIN_NOT_FOUND') return res.status(404).json({ message: 'DOMAIN_NOT_FOUND' });
    
    logger.error('// GET_LIMITS_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const seedSuperAdmin = async (req: Request, res: Response) => {
  try {
    await authAdminService.seedSuperAdmin(req.body);
    res.json({ message: 'Superadmin access granted' });
  } catch (error: any) {
    if (error.message === 'INVALID_SECRET_CODE') return res.status(403).json({ message: 'Invalid admin secret code' });
    
    res.status(500).json({ message: error.message });
  }
};
