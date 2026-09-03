import { Request, Response } from 'express';
import * as securityStaffService from '../services/securityStaffService';
import logger from '../utils/logger';

export const getSecurityStaff = async (req: Request, res: Response) => {
  try {
    const staff = await securityStaffService.getSecurityStaff((req as any).user);
    res.json(staff);
  } catch (error) {
    logger.error('// GET_STAFF_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const addSecurityStaff = async (req: Request, res: Response) => {
  try {
    const result = await securityStaffService.addSecurityStaff(req.body, (req as any).user);
    res.status(201).json({ message: 'SECURITY_STAFF_ADDED', generatedPassword: result.generatedPassword });
  } catch (error: any) {
    if (error.message === 'NAME_AND_EMAIL_REQUIRED') return res.status(400).json({ message: 'NAME_AND_EMAIL_REQUIRED' });
    if (error.message === 'EMAIL_ALREADY_IN_USE') return res.status(400).json({ message: 'EMAIL_ALREADY_IN_USE' });
    
    logger.error('// ADD_SECURITY_FAULT:', error);
    res.status(500).json({ message: error.message || 'INTERNAL_SERVER_ERROR' });
  }
};

export const updateSecurityStaff = async (req: Request, res: Response) => {
  try {
    const staff = await securityStaffService.updateSecurityStaff(req.params.id, req.body, (req as any).user);
    res.json({ message: 'STAFF_UPDATED', staff });
  } catch (error: any) {
    if (error.message === 'STAFF_NOT_FOUND') return res.status(404).json({ message: 'STAFF_NOT_FOUND' });
    if (error.message === 'AUTH_DOMAIN_MISMATCH') return res.status(403).json({ message: 'AUTH_DOMAIN_MISMATCH' });
    
    logger.error('// UPDATE_STAFF_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const terminateSecurityStaff = async (req: Request, res: Response) => {
  try {
    const staff = await securityStaffService.terminateSecurityStaff(req.params.id, (req as any).user);
    res.json({ message: 'STAFF_TERMINATED', staff });
  } catch (error: any) {
    if (error.message === 'STAFF_NOT_FOUND') return res.status(404).json({ message: 'STAFF_NOT_FOUND' });
    if (error.message === 'AUTH_DOMAIN_MISMATCH') return res.status(403).json({ message: 'AUTH_DOMAIN_MISMATCH' });
    
    logger.error('// TERMINATE_STAFF_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getSecurityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await securityStaffService.getSecurityLogs((req as any).user);
    res.json(logs);
  } catch (error) {
    logger.error('// GET_SEC_LOGS_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
