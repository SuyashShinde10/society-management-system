import { Request, Response } from 'express';
import * as sustainabilityService from '../services/sustainabilityService';
import logger from '../utils/logger';

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const data = await sustainabilityService.getOrCreateSustainability((req as any).user.societyId);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch sustainability metrics' });
  }
};

export const updateTank = async (req: Request, res: Response) => {
  try {
    const { tankName, levelPercent } = req.body;
    const data = await sustainabilityService.updateTankLevel((req as any).user.societyId, tankName, levelPercent);
    res.status(200).json({ message: 'Tank level updated', data });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update tank level' });
  }
};

export const addTanker = async (req: Request, res: Response) => {
  try {
    const data = await sustainabilityService.logTankerDelivery((req as any).user.societyId, req.body);
    res.status(201).json({ message: 'Tanker delivery logged', data });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to log tanker' });
  }
};

export const startEV = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.body;
    const station = await sustainabilityService.startEVSession((req as any).user.societyId, stationId, (req as any).user);
    res.status(200).json({ message: 'EV charging session started', station });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to start EV session' });
  }
};

export const stopEV = async (req: Request, res: Response) => {
  try {
    const { stationId, kwhConsumed } = req.body;
    const station = await sustainabilityService.stopEVSession((req as any).user.societyId, stationId, kwhConsumed);
    res.status(200).json({ message: 'EV charging session ended', station });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to end EV session' });
  }
};

export const addSolar = async (req: Request, res: Response) => {
  try {
    const data = await sustainabilityService.recordSolarMetric((req as any).user.societyId, req.body);
    res.status(201).json({ message: 'Solar metric recorded', data });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to record solar metric' });
  }
};
