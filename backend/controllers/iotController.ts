import { Request, Response } from 'express';
import * as iotService from '../services/iotService';
import logger from '../utils/logger';

export const pollIoTData = async (req: Request, res: Response) => {
  try {
    const result = await iotService.pollIoTData((req as any).user);

    res.status(200).json({
      message: 'IoT Polling completed successfully',
      metersScanned: result.metersScanned,
      anomaliesDetected: result.anomaliesDetected
    });

  } catch (error) {
    logger.error('Error polling IoT data:', error);
    res.status(500).json({ error: 'Server error during IoT poll' });
  }
};
