import { Request, Response } from 'express';
import * as noticeService from '../services/noticeService';
import logger from '../utils/logger';

export const getNotices = async (req: Request, res: Response) => {
  try {
    const notices = await noticeService.getNotices((req as any).user);
    res.json(notices);
  } catch (error) {
    logger.error('Error fetching notices:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const addNotice = async (req: Request, res: Response) => {
  try {
    const notice = await noticeService.addNotice(req.body, (req as any).user);
    res.status(201).json(notice);
  } catch (error: any) {
    const knownErrors: { [key: string]: number } = {
      'TITLE_AND_CONTENT_REQUIRED': 400,
      'ACCOUNT_NOT_LINKED_TO_SOCIETY': 400,
      'MEMBER_NOT_FOUND_IN_SOCIETY': 404
    };
    if (error.message && knownErrors[error.message]) {
      return res.status(knownErrors[error.message]).json({ message: error.message });
    }
    
    logger.error('Add Notice Error:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const deleteNotice = async (req: Request, res: Response) => {
  try {
    await noticeService.deleteNotice(req.params.id, (req as any).user);
    res.json({ message: 'NOTICE_REMOVED' });
  } catch (error: any) {
    if (error.message === 'NOTICE_NOT_FOUND') return res.status(404).json({ message: error.message });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ message: error.message });
    
    logger.error('Error deleting notice:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
