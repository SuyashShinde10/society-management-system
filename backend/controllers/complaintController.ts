import { Request, Response } from 'express';
import * as complaintService from '../services/complaintService';
import logger from '../utils/logger';

export const getComplaints = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await complaintService.getComplaints((req as any).user, limit, req.query.cursor as string);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const addComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await complaintService.addComplaint(req.body, (req as any).user);
    res.status(201).json(complaint);
  } catch (error: any) {
    const knownErrors: { [key: string]: number } = {
      'TITLE_AND_DESCRIPTION_REQUIRED': 400,
      'INVALID_ATTACHMENT_PROTOCOL': 400,
      'INVALID_ATTACHMENT_URL': 400
    };
    if (error.message && knownErrors[error.message]) {
      return res.status(knownErrors[error.message]).json({ message: error.message });
    }
    logger.error('Error creating complaint:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const updateComplaintStatus = async (req: Request, res: Response) => {
  try {
    const updatedComplaint = await complaintService.updateComplaintStatus(req.params.id, req.body.status, (req as any).user);
    res.status(200).json(updatedComplaint);
  } catch (error: any) {
    const knownErrors: { [key: string]: number } = {
      'INVALID_STATUS_VALUE': 400,
      'COMPLAINT_NOT_FOUND': 404,
      'FORBIDDEN': 403
    };
    if (error.message && knownErrors[error.message]) {
      return res.status(knownErrors[error.message]).json({ message: error.message });
    }
    logger.error('Error updating status:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

export const deleteComplaint = async (req: Request, res: Response) => {
  try {
    const id = await complaintService.deleteComplaint(req.params.id, (req as any).user);
    res.status(200).json({ id });
  } catch (error: any) {
    if (error.message === 'COMPLAINT_NOT_FOUND') return res.status(404).json({ message: error.message });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ message: error.message });
    
    logger.error('Error deleting complaint:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
