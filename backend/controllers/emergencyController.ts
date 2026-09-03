import { Request, Response } from 'express';
import * as emergencyService from '../services/emergencyService';
import logger from '../utils/logger';

export const triggerEmergency = async (req: Request, res: Response) => {
  try {
    const result = await emergencyService.triggerEmergency(req.body, (req as any).user);
    res.status(200).json({
      success: true,
      message: 'Emergency protocol activated successfully',
      ...result
    });
  } catch (error) {
    logger.error('Error triggering emergency:', error);
    res.status(500).json({ error: 'Server error triggering emergency' });
  }
};
