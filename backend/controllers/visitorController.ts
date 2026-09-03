import { Request, Response } from 'express';
import * as visitorService from '../services/visitorService';
import logger from '../utils/logger';

export const checkInVisitor = async (req: Request, res: Response) => {
  try {
    const visitor = await visitorService.checkInVisitor(req.body, (req as any).user);
    res.status(201).json({ message: 'Visitor checked in successfully', visitor });
  } catch (error: any) {
    if (error.message === 'MISSING_FIELDS') {
      return res.status(400).json({ message: 'Name, phone and purpose are required' });
    }
    logger.error('// CHECKIN_VISITOR_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const checkOutVisitor = async (req: Request, res: Response) => {
  try {
    const visitor = await visitorService.checkOutVisitor(req.params.id, (req as any).user);
    res.json({ message: 'Visitor checked out successfully', visitor });
  } catch (error: any) {
    if (error.message === 'VISITOR_NOT_FOUND') return res.status(404).json({ message: 'Visitor not found' });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ message: 'Forbidden' });
    
    logger.error('// CHECKOUT_VISITOR_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getSocietyVisitors = async (req: Request, res: Response) => {
  try {
    const visitors = await visitorService.getSocietyVisitors((req as any).user);
    res.json(visitors);
  } catch (error) {
    logger.error('// GET_VISITORS_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getMyVisitors = async (req: Request, res: Response) => {
  try {
    const visitors = await visitorService.getMyVisitors((req as any).user);
    res.json(visitors);
  } catch (error) {
    logger.error('// GET_MY_VISITORS_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
