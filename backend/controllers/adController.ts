import { Request, Response } from 'express';
import AdCampaign from '../models/AdCampaign';

export const getActiveAds = async (req: Request, res: Response) => {
  try {
    const societyId = (req as any).user?.societyId || req.params.societyId;
    const ads = await AdCampaign.find({ 
      societyId, 
      status: 'Active',
      expiresAt: { $gt: new Date() } 
    }).sort('-bidAmount'); // Highest bidder gets top spot

    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching ads' });
  }
};

export const submitBid = async (req: Request, res: Response) => {
  try {
    const { vendorName, title, description, imageUrl, contactUrl, bidAmount, durationDays } = req.body;
    const societyId = req.params.societyId; // Public route for vendors to bid

    if (!societyId) {
      return res.status(400).json({ error: 'Society ID required' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (durationDays || 30));

    const ad = await AdCampaign.create({
      societyId,
      vendorName,
      title,
      description,
      imageUrl,
      contactUrl,
      bidAmount,
      expiresAt,
      status: 'Active' // Auto-approve for demo
    });

    res.status(201).json({ message: 'Ad bid submitted successfully', ad });
  } catch (error) {
    res.status(500).json({ error: 'Server error submitting bid' });
  }
};
