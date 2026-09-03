import { Request, Response } from 'express';
import * as expenseService from '../services/expenseService';
import logger from '../utils/logger';

// @desc    Get all expenses for the society
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await expenseService.getExpenses((req as any).user);
    res.json(expenses);
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc    Add a new expense (Admin only)
export const addExpense = async (req: Request, res: Response) => {
  try {
    const expense = await expenseService.addExpense(req.body, (req as any).user);
    res.status(201).json(expense);
  } catch (error: any) {
    const knownErrors: { [key: string]: number } = {
      'TITLE_AMOUNT_CATEGORY_REQUIRED': 400,
      'ACCOUNT_NOT_LINKED_TO_SOCIETY': 400,
      'AMOUNT_MUST_BE_POSITIVE': 400
    };
    if (error.message && knownErrors[error.message]) {
      return res.status(knownErrors[error.message]).json({ message: error.message });
    }
    logger.error('Error adding expense:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc    Delete an expense (Admin only)
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    await expenseService.deleteExpense(req.params.id, (req as any).user);
    res.json({ message: 'EXPENSE_REMOVED' });
  } catch (error: any) {
    if (error.message === 'EXPENSE_NOT_FOUND') return res.status(404).json({ message: error.message });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ message: error.message });

    logger.error('Error deleting expense:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
