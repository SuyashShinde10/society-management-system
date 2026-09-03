import { Request, Response } from 'express';
import { getAdminAnalyticsData, getMemberAnalyticsData, getPredictiveMaintenanceData, getSentimentAnalysisData } from '../services/analyticsService';
import getRedis from '../utils/redis';
import logger from '../utils/logger';

const redisClient = getRedis();

export const getPredictiveMaintenance = async (req: Request, res: Response) => {
  try {
    const societyId = (req as any).user?.societyId || req.params.societyId;
    const result = await getPredictiveMaintenanceData(societyId);

    if (result.status === 'no_data') {
      return res.status(200).json({ analysis: result.analysis });
    }
    
    res.status(202).json({ message: 'Analysis started', jobId: result.jobId });
  } catch (error) {
    logger.error('Error in predictive maintenance analytics:', error);
    res.status(500).json({ error: 'Server error generating predictive maintenance' });
  }
};

export const getSentimentAnalysis = async (req: Request, res: Response) => {
  try {
    const societyId = (req as any).user?.societyId || req.params.societyId;
    const result = await getSentimentAnalysisData(societyId);

    if (result.status === 'no_data') {
      return res.status(200).json({ score: result.score, explanation: result.explanation });
    }
    
    res.status(202).json({ message: 'Sentiment analysis started', jobId: result.jobId });
  } catch (error) {
    logger.error('Error in sentiment analysis:', error);
    res.status(500).json({ error: 'Server error generating sentiment analysis' });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const role = (req as any).user.role;
    const societyId = (req as any).user.societyId;

    if (redisClient) {
      const cached = await redisClient.get(`analytics:${societyId}:${role}:${userId}`);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    if (role === 'admin') {
      const responseData = await getAdminAnalyticsData(societyId);
      
      if (redisClient) {
        await redisClient.set(`analytics:${societyId}:${role}:${userId}`, JSON.stringify(responseData), 'EX', 300);
      }
      return res.json(responseData);
    } else {
      const responseData = await getMemberAnalyticsData(societyId, userId);

      if (redisClient) {
        await redisClient.set(`analytics:${societyId}:${role}:${userId}`, JSON.stringify(responseData), 'EX', 300);
      }
      return res.json(responseData);
    }
  } catch (error) {
    logger.error('// ANALYTICS_ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};
