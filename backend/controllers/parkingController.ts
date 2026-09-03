import { Request, Response } from 'express';
import * as parkingService from '../services/parkingService';
import logger from '../utils/logger';

export const createParkingSpace = async (req: Request, res: Response) => {
  try {
    const parkingSpace = await parkingService.createParkingSpace(req.body, (req as any).user.societyId);
    res.status(201).json({ message: 'Parking space created successfully', parkingSpace });
  } catch (error) {
    logger.error('Error creating parking space:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const enforceParking = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, vehicleNumber } = req.body;
    const result = await parkingService.enforceParking(latitude, longitude, vehicleNumber, (req as any).user.societyId);

    if (result.status === 'OK') {
      return res.status(200).json(result);
    } else {
      return res.status(200).json(result);
    }
  } catch (error: any) {
    if (error.message === 'No parking space found at this location.') {
      return res.status(404).json({ message: error.message });
    }
    logger.error('Error enforcing parking:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllParkingSpaces = async (req: Request, res: Response) => {
  try {
    const societyId = (req as any).user.societyId || req.params.societyId;
    const spaces = await parkingService.getAllParkingSpaces(societyId);
    res.status(200).json(spaces);
  } catch (error) {
    logger.error('Error fetching parking spaces:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const alprScan = async (req: Request, res: Response) => {
  try {
    const result = await parkingService.alprScan(req.body.plateNumber, (req as any).user.societyId);
    
    if (result.authorized) {
      return res.status(200).json(result);
    } else {
      return res.status(403).json(result);
    }
  } catch (error: any) {
    if (error.message === 'Plate number is required') {
      return res.status(400).json({ error: error.message });
    }
    logger.error('Error in ALPR scan:', error);
    res.status(500).json({ error: 'Server error during ALPR scan' });
  }
};
