import { Request, Response } from 'express';
import * as escrowService from '../services/escrowService';
import logger from '../utils/logger';

export const getAllEscrows = async (req: Request, res: Response) => {
  try {
    const escrows = await escrowService.getAllEscrows((req as any).user);
    res.status(200).json(escrows);
  } catch (error: any) {
    if (error.message === 'ADMIN_NO_SOCIETY') {
      return res.status(403).json({ error: 'Admin must be associated with a society.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const createEscrow = async (req: Request, res: Response) => {
  try {
    const escrow = await escrowService.createEscrow(req.body, (req as any).user);
    res.status(201).json({ message: 'Escrow account created', escrow });
  } catch (error: any) {
    if (error.message === 'NOT_AUTHORIZED_SOCIETY') {
      return res.status(403).json({ error: 'Not authorized for this society' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyGeofence = async (req: Request, res: Response) => {
  try {
    const { escrowId, latitude, longitude } = req.body;
    const escrow = await escrowService.verifyGeofence(escrowId, latitude, longitude);
    return res.status(200).json({ message: 'Geofence verified successfully', escrow });
  } catch (error: any) {
    if (error.message === 'ESCROW_NOT_FOUND') return res.status(404).json({ error: 'Escrow not found' });
    if (error.message === 'GEOFENCE_NOT_CONFIGURED') return res.status(400).json({ error: 'Society geofence not configured' });
    if (error.message === 'OUTSIDE_GEOFENCE') return res.status(400).json({ error: 'Vendor is not within the society premises' });
    
    logger.error('Error verifying geofence:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyResident = async (req: Request, res: Response) => {
  try {
    const { escrowId } = req.body;
    const escrow = await escrowService.verifyResident(escrowId, (req as any).user);
    res.status(200).json({ message: 'Resident verification successful', escrow });
  } catch (error: any) {
    if (error.message === 'ESCROW_NOT_FOUND') return res.status(404).json({ error: 'Escrow not found' });
    if (error.message === 'NOT_AUTHORIZED_SOCIETY') return res.status(403).json({ error: 'Not authorized for this society' });
    
    res.status(500).json({ error: 'Server error' });
  }
};
