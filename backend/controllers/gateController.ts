import { Request, Response } from 'express';
import * as gateService from '../services/gateService';
import logger from '../utils/logger';

export const logParcel = async (req: Request, res: Response) => {
  try {
    const parcel = await gateService.logParcel(req.body, (req as any).user);
    res.status(201).json({ message: 'Parcel logged successfully', parcel });
  } catch (error: any) {
    logger.error('Error logging parcel:', error);
    res.status(400).json({ error: error.message || 'Failed to log parcel' });
  }
};

export const claimParcel = async (req: Request, res: Response) => {
  try {
    const { parcelId, claimOtp } = req.body;
    const parcel = await gateService.claimParcel(parcelId, claimOtp, (req as any).user);
    res.status(200).json({ message: 'Parcel claimed successfully', parcel });
  } catch (error: any) {
    logger.error('Error claiming parcel:', error);
    res.status(400).json({ error: error.message || 'Failed to claim parcel' });
  }
};

export const getParcels = async (req: Request, res: Response) => {
  try {
    const parcels = await gateService.getMyParcels((req as any).user);
    res.status(200).json(parcels);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error fetching parcels' });
  }
};

export const addStaff = async (req: Request, res: Response) => {
  try {
    const staff = await gateService.addStaff(req.body, (req as any).user);
    res.status(201).json({ message: 'Staff added successfully', staff });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to add staff' });
  }
};

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const staffList = await gateService.getAllStaff((req as any).user.societyId);
    res.status(200).json(staffList);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error fetching staff' });
  }
};

export const checkInStaff = async (req: Request, res: Response) => {
  try {
    const attendance = await gateService.checkInStaff(req.params.id, (req as any).user);
    res.status(200).json({ message: 'Staff checked in successfully', attendance });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to check in staff' });
  }
};

export const checkOutStaff = async (req: Request, res: Response) => {
  try {
    const attendance = await gateService.checkOutStaff(req.params.id, (req as any).user);
    res.status(200).json({ message: 'Staff checked out successfully', attendance });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to check out staff' });
  }
};

export const createGuestPass = async (req: Request, res: Response) => {
  try {
    const pass = await gateService.createGuestPass(req.body, (req as any).user);
    res.status(201).json({ message: 'Guest pass created successfully', pass });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create guest pass' });
  }
};

export const verifyGuestPass = async (req: Request, res: Response) => {
  try {
    const { passCode } = req.body;
    const pass = await gateService.verifyGuestPass(passCode, (req as any).user);
    res.status(200).json({ message: 'Guest pass verified! Entry allowed.', pass });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Invalid or expired pass' });
  }
};

export const getGuestPasses = async (req: Request, res: Response) => {
  try {
    const passes = await gateService.getMyGuestPasses((req as any).user);
    res.status(200).json(passes);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error fetching guest passes' });
  }
};
