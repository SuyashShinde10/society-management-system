import { Request, Response } from 'express';
import { aiQueue } from '../workers/aiQueue';
import logger from '../utils/logger';

export const queryChatbot = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    const job = await aiQueue.add('chatbot', { residentId: (req as any).user.id, message });
    
    res.status(202).json({ message: 'Processing chatbot query', jobId: job.id });
  } catch (error) {
    logger.error('Error in chatbot query:', error);
    res.status(500).json({ error: 'Failed to process chatbot query.' });
  }
};
