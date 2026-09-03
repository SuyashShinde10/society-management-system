import { Request, Response } from 'express';
import * as vendorService from '../services/vendorService';
import logger from '../utils/logger';

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await vendorService.createProject(req.body, (req as any).user);
    res.status(201).json({ project });
  } catch (error: any) {
    if (error.message === 'NOT_AUTHORIZED') return res.status(403).json({ error: 'Not authorized' });
    logger.error('Error creating project:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await vendorService.getProjects((req as any).user);
    res.status(200).json(projects);
  } catch (error: any) {
    if (error.message === 'ADMIN_NO_SOCIETY') return res.status(403).json({ error: 'Admin must be associated with a society.' });
    logger.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProjectDetails = async (req: Request, res: Response) => {
  try {
    const result = await vendorService.getProjectDetails(req.params.id);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'PROJECT_NOT_FOUND') return res.status(404).json({ error: 'Project not found' });
    logger.error('Error fetching project details:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProjectPublicDetails = async (req: Request, res: Response) => {
  try {
    const project = await vendorService.getProjectPublicDetails(req.params.projectId);
    res.status(200).json(project);
  } catch (error: any) {
    if (error.message === 'PROJECT_NOT_FOUND') return res.status(404).json({ error: 'Project not found' });
    logger.error('Error fetching public project details:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const submitQuote = async (req: Request, res: Response) => {
  try {
    const quote = await vendorService.submitQuote(req.params.projectId, req.body);
    res.status(201).json({ message: 'Quote submitted successfully', quote });
  } catch (error: any) {
    if (error.message === 'PROJECT_NOT_FOUND') return res.status(404).json({ error: 'Project not found' });
    if (error.message === 'PROJECT_NOT_OPEN') return res.status(400).json({ error: 'Project is no longer accepting quotes' });
    
    logger.error('Error submitting quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const analyzeQuotes = async (req: Request, res: Response) => {
  try {
    const { job, project } = await vendorService.analyzeQuotes(req.params.projectId, (req as any).user);
    res.status(202).json({ message: 'Quote analysis started in background.', jobId: job.id, project });
  } catch (error: any) {
    if (error.message === 'NOT_AUTHORIZED') return res.status(403).json({ error: 'Not authorized' });
    if (error.message === 'PROJECT_NOT_FOUND') return res.status(404).json({ error: 'Project not found' });
    if (error.message === 'NO_QUOTES_TO_ANALYZE') return res.status(400).json({ error: 'No quotes to analyze' });
    
    logger.error('Error analyzing quotes:', error);
    res.status(500).json({ error: 'Server error analyzing quotes' });
  }
};
