import { Request, Response } from 'express';
import * as meetingService from '../services/meetingService';
import logger from '../utils/logger';

// @desc    Get all meetings for a society
// @route   GET /api/meetings
// @access  Private (Admin & Member)
export const getMeetings = async (req: Request, res: Response) => {
  try {
    const meetings = await meetingService.getMeetings((req as any).user);
    res.status(200).json(meetings);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching meetings', error: error.message });
  }
};

// @desc    Create a new meeting
// @route   POST /api/meetings
// @access  Private (Admin)
export const createMeeting = async (req: Request, res: Response) => {
  try {
    const meeting = await meetingService.createMeeting(req.body, (req as any).user);
    res.status(201).json(meeting);
  } catch (error: any) {
    if (error.message === 'MISSING_FIELDS') {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    if (error.message === 'MEMBER_NOT_FOUND_IN_SOCIETY') {
      return res.status(404).json({ message: 'MEMBER_NOT_FOUND_IN_SOCIETY' });
    }
    res.status(500).json({ message: 'Server error creating meeting', error: error.message });
  }
};

// @desc    Delete a meeting
// @route   DELETE /api/meetings/:id
// @access  Private (Admin)
export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    await meetingService.deleteMeeting(req.params.id, (req as any).user);
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error: any) {
    if (error.message === 'MEETING_NOT_FOUND') return res.status(404).json({ message: 'Meeting not found' });
    if (error.message === 'NOT_AUTHORIZED') return res.status(403).json({ message: 'Not authorized to delete this meeting' });
    
    res.status(500).json({ message: 'Server error deleting meeting', error: error.message });
  }
};
