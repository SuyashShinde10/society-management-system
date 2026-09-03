import { Request, Response } from 'express';
import * as billService from '../services/billService';
import logger from '../utils/logger';

// @desc  Generate bills based on target selection
// @route POST /api/bills/generate
// @access Admin
export const generateBills = async (req: Request, res: Response) => {
  try {
    const result = await billService.generateBills(req.body, (req as any).user);
    res.status(201).json({
      message: `Generated ${result.bills.length} bills. ${result.errors.length} skipped.`,
      bills: result.bills,
      errors: result.errors,
    });
  } catch (error: any) {
    const knownErrors: { [key: string]: number } = {
      'TITLE_AND_AMOUNT_REQUIRED': 400,
      'SOCIETY_NOT_FOUND': 404,
      'TARGET_USER_REQUIRED': 400,
      'MEMBER_NOT_FOUND': 404
    };
    if (error.message && knownErrors[error.message]) {
      return res.status(knownErrors[error.message]).json({ message: error.message });
    }
    logger.error('Error generating bills:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Get all bills for the society (admin) or own bills (member)
// @route GET /api/bills
// @access Protected
export const getBills = async (req: Request, res: Response) => {
  try {
    const result = await billService.getBills((req as any).user, req.query.cursor as string);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching bills:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Mark a bill as paid or submit for verification
// @route PUT /api/bills/:id/pay
export const markBillPaid = async (req: Request, res: Response) => {
  try {
    const updatedBill = await billService.markBillPaid(req.params.id, req.body, (req as any).user);
    res.json(updatedBill);
  } catch (error: any) {
    const knownErrors: { [key: string]: number } = {
      'BILL_NOT_FOUND': 404,
      'FORBIDDEN': 403,
      'NOT_YOUR_BILL': 403,
      'BILL_ALREADY_PENDING': 400,
      'BILL_ALREADY_PAID': 400,
      'ALREADY_UNDER_VERIFICATION': 400
    };
    if (error.message && knownErrors[error.message]) {
      return res.status(knownErrors[error.message]).json({ message: error.message });
    }
    logger.error('Error marking bill paid:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Delete a bill
// @route DELETE /api/bills/:id
// @access Admin
export const deleteBill = async (req: Request, res: Response) => {
  try {
    await billService.deleteBill(req.params.id, (req as any).user);
    res.json({ message: 'BILL_DELETED' });
  } catch (error: any) {
    if (error.message === 'BILL_NOT_FOUND') return res.status(404).json({ message: error.message });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ message: error.message });
    
    logger.error('Error deleting bill:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Create Stripe Checkout Session for a bill
// @route POST /api/bills/:id/checkout
export const createCheckout = async (req: Request, res: Response) => {
  try {
    const sessionUrl = await billService.createCheckout(req.params.id, (req as any).user);
    res.json({ url: sessionUrl });
  } catch (error: any) {
    if (error.message === 'BILL_NOT_FOUND') return res.status(404).json({ message: error.message });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ message: error.message });
    if (error.message === 'BILL_ALREADY_PAID') return res.status(400).json({ message: error.message });
    
    logger.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Verify Stripe Checkout Session
// @route POST /api/bills/verify-payment
export const verifyStripePayment = async (req: Request, res: Response) => {
  try {
    const bill = await billService.verifyStripePaymentData(req.body.sessionId);
    return res.json({ success: true, bill });
  } catch (error: any) {
    if (error.message === 'SESSION_ID_REQUIRED') return res.status(400).json({ message: error.message });
    if (error.message === 'PAYMENT_NOT_VERIFIED') return res.status(400).json({ success: false, message: 'Payment not verified' });
    
    logger.error('Error verifying checkout session:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
