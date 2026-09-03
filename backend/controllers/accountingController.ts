import { Request, Response } from 'express';
import * as accountingService from '../services/accountingService';
import logger from '../utils/logger';

export const exportTally = async (req: Request, res: Response) => {
  try {
    const xml = await accountingService.generateTallyXML((req as any).user.societyId);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="tally_vouchers.xml"');
    res.status(200).send(xml);
  } catch (error: any) {
    logger.error('Error generating Tally XML:', error);
    res.status(500).json({ error: 'Failed to generate Tally export' });
  }
};

export const exportCSV = async (req: Request, res: Response) => {
  try {
    const csv = await accountingService.generateAccountingCSV((req as any).user.societyId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="society_ledger.csv"');
    res.status(200).send(csv);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
};

export const getTaxSummary = async (req: Request, res: Response) => {
  try {
    const summary = await accountingService.getTaxSummary((req as any).user.societyId);
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate tax summary' });
  }
};

export const createSinkingFund = async (req: Request, res: Response) => {
  try {
    const fund = await accountingService.createSinkingFund(req.body, (req as any).user);
    res.status(201).json({ message: 'Sinking Fund created', fund });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create fund' });
  }
};

export const getSinkingFunds = async (req: Request, res: Response) => {
  try {
    const funds = await accountingService.getSinkingFunds((req as any).user.societyId);
    res.status(200).json(funds);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch sinking funds' });
  }
};
