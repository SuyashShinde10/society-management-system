import { Request, Response } from 'express';
import Society from '../models/Society';

export const getTheme = async (req: Request, res: Response) => {
  try {
    const societyId = (req as any).user.societyId;
    const society = await Society.findById(societyId).select('themeConfig');
    
    if (!society) {
      return res.status(404).json({ error: 'Society not found' });
    }

    res.status(200).json({ themeConfig: (society as any).themeConfig });
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

    res.status(200).json({ message: 'Theme updated successfully', themeConfig: (society as any).themeConfig });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating theme' });
  }
};
