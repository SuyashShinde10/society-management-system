import { Request, Response } from 'express';
import * as superAdminService from '../services/superAdminService';
import logger from '../utils/logger';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const data = await superAdminService.getDashboardStats();
    res.json(data);
  } catch (error) {
    logger.error('// SUPER_ADMIN_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const deleteSociety = async (req: Request, res: Response) => {
  try {
    await superAdminService.deleteSociety(req.params.id);
    res.json({ message: 'SOCIETY_DELETED' });
  } catch (error) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const suspendSociety = async (req: Request, res: Response) => {
  try {
    const society = await superAdminService.suspendSociety(req.params.id);
    res.json({ message: society.isActive ? 'SOCIETY_ACTIVATED' : 'SOCIETY_SUSPENDED', society });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ message: 'NOT_FOUND' });
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const broadcastNotice = async (req: Request, res: Response) => {
  try {
    await superAdminService.broadcastNotice(req.body, (req as any).user);
    res.json({ message: 'NOTICE_BROADCASTED_SUCCESSFULLY' });
  } catch (error: any) {
    if (error.message === 'REQUIRED_FIELDS_MISSING') return res.status(400).json({ message: 'REQUIRED_FIELDS_MISSING' });
    logger.error('// BROADCAST_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getLogsAndAlerts = async (req: Request, res: Response) => {
  try {
    const data = await superAdminService.getLogsAndAlerts();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const impersonate = async (req: Request, res: Response) => {
  try {
    const result = await superAdminService.impersonate(req.body.email, (req as any).user);
    
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000
    });

    res.json({ user: result.targetUser });
  } catch (error: any) {
    if (error.message === 'EMAIL_REQUIRED') return res.status(400).json({ message: 'Email required' });
    if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'User not found' });
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const society = await superAdminService.updatePlan(req.params.id, req.body, (req as any).user);
    res.json({ message: 'Plan updated successfully', society });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ message: 'Society not found' });
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const backupDatabase = async (req: Request, res: Response) => {
  try {
    const backup = await superAdminService.backupDatabase((req as any).user);
    res.json({ ...backup, message: 'Users backup is omitted from API response for privacy compliance.' });
  } catch (error) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
