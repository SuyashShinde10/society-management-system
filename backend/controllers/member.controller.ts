import { Request, Response } from 'express';
import * as memberService from '../services/memberService';
import logger from '../utils/logger';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await memberService.getAllUsers((req as any).user);
    res.json(users);
  } catch (error) {
    logger.error('// GET_USERS_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getPendingMembers = async (req: Request, res: Response) => {
  try {
    const users = await memberService.getPendingMembers((req as any).user);
    res.json(users);
  } catch (error) {
    logger.error('// GET_PENDING_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const approveMember = async (req: Request, res: Response) => {
  try {
    await memberService.approveMember(req.params.id, (req as any).user);
    res.json({ message: 'MEMBER_APPROVED' });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'USER_NOT_FOUND' });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ message: 'FORBIDDEN' });
    
    logger.error('// APPROVE_MEMBER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await memberService.deleteUser(req.params.id, (req as any).user);
    res.json({ message: 'RECORD_DELETED' });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'USER_NOT_FOUND' });
    if (error.message === 'AUTH_DOMAIN_MISMATCH') return res.status(403).json({ message: 'AUTH_DOMAIN_MISMATCH' });
    
    logger.error('// DELETE_USER_FAULT:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const result = await memberService.addMember(req.body, (req as any).user);
    res.status(201).json({ 
      message: 'MEMBER_ADDED_TO_REGISTRY',
      user: result.user,
      generatedPassword: result.generatedPassword
    });
  } catch (error: any) {
    if (error.message === 'NAME_AND_EMAIL_REQUIRED') return res.status(400).json({ message: 'NAME_AND_EMAIL_REQUIRED' });
    if (error.message === 'USER_IDENT_ALREADY_EXISTS') return res.status(400).json({ message: 'USER_IDENT_ALREADY_EXISTS' });
    
    logger.error('// ADD_MEMBER_FAULT:', error);
    res.status(500).json({ message: error.message || 'INTERNAL_SERVER_ERROR' });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const safeUser = await memberService.updateMember(req.params.id, req.body, (req as any).user);
    res.json({ message: 'RECORD_MODIFIED', user: safeUser });
  } catch (error: any) {
    if (error.message === 'RECORD_NOT_FOUND') return res.status(404).json({ message: 'RECORD_NOT_FOUND' });
    if (error.message === 'AUTH_DOMAIN_MISMATCH') return res.status(403).json({ message: 'AUTH_DOMAIN_MISMATCH' });
    if (error.message === 'EMAIL_ALREADY_IN_USE') return res.status(400).json({ message: 'EMAIL_ALREADY_IN_USE' });
    
    logger.error('// UPDATE_MEMBER_FAULT:', error);
    res.status(500).json({ message: error.message || 'INTERNAL_SERVER_ERROR' });
  }
};
