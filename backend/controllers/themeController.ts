import { Request, Response } from 'express';
import Society from '../models/Society';
import getRedis from '../utils/redis';

const redis = getRedis();

export const getTheme = async (req: Request, res: Response) => {
  try {
    const societyId = (req as any).user.societyId;

    if (redis && redis.status === 'ready') {
      try {
        const cached = await redis.get(`theme:${societyId}`);
        if (cached) {
          return res.status(200).json({ themeConfig: JSON.parse(cached) });
        }
      } catch (cacheErr) {}
    }

    const society = await Society.findById(societyId).select('themeConfig').lean();
    
    if (!society) {
      return res.status(404).json({ error: 'Society not found' });
    }

    const themeConfig = (society as any).themeConfig;

    if (redis && redis.status === 'ready' && themeConfig) {
      try {
        await redis.set(`theme:${societyId}`, JSON.stringify(themeConfig), 'EX', 300);
      } catch (cacheErr) {}
    }

    res.status(200).json({ themeConfig });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching theme' });
  }
};

export const updateTheme = async (req: Request, res: Response) => {
  try {
    const { accentColor, bg } = req.body;
    const societyId = (req as any).user.societyId;

    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({ error: 'Society not found' });
    }

    (society as any).themeConfig = {
      accentColor: accentColor || (society as any).themeConfig.accentColor,
      bg: bg || (society as any).themeConfig.bg
    };

    await society.save();

    if (redis && redis.status === 'ready') {
      try {
        await redis.del(`theme:${societyId}`);
      } catch (cacheErr) {}
    }

    res.status(200).json({ message: 'Theme updated successfully', themeConfig: (society as any).themeConfig });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating theme' });
  }
};
