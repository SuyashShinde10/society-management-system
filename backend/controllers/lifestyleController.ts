import { Request, Response } from 'express';
import * as lifestyleService from '../services/lifestyleService';
import logger from '../utils/logger';

export const getAmenities = async (req: Request, res: Response) => {
  try {
    const amenities = await lifestyleService.getAmenities((req as any).user.societyId);
    res.status(200).json(amenities);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
};

export const createAmenity = async (req: Request, res: Response) => {
  try {
    const amenity = await lifestyleService.createAmenity(req.body, (req as any).user);
    res.status(201).json({ message: 'Amenity created', amenity });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create amenity' });
  }
};

export const bookSlot = async (req: Request, res: Response) => {
  try {
    const booking = await lifestyleService.bookAmenitySlot(req.body, (req as any).user);
    res.status(201).json({ message: 'Slot booked successfully!', booking });
  } catch (error: any) {
    logger.error('Error booking amenity slot:', error);
    res.status(400).json({ error: error.message || 'Failed to book slot' });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await lifestyleService.getMyBookings((req as any).user);
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const createClassified = async (req: Request, res: Response) => {
  try {
    const classified = await lifestyleService.createClassified(req.body, (req as any).user);
    res.status(201).json({ message: 'Classified posted!', classified });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create classified' });
  }
};

export const getClassifieds = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const classifieds = await lifestyleService.getClassifieds((req as any).user.societyId, category as string);
    res.status(200).json(classifieds);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch classifieds' });
  }
};

export const createResolution = async (req: Request, res: Response) => {
  try {
    const resolution = await lifestyleService.createResolution(req.body, (req as any).user);
    res.status(201).json({ message: 'Resolution proposed for AGM', resolution });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create resolution' });
  }
};

export const getResolutions = async (req: Request, res: Response) => {
  try {
    const resolutions = await lifestyleService.getResolutions((req as any).user.societyId);
    res.status(200).json(resolutions);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch resolutions' });
  }
};

export const castVote = async (req: Request, res: Response) => {
  try {
    const { optionIndex } = req.body;
    const resolution = await lifestyleService.castVote(req.params.id, optionIndex, (req as any).user);
    res.status(200).json({ message: 'Vote recorded confidentially!', resolution });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to cast vote' });
  }
};
