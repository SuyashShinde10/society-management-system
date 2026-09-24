import Expense from '../models/Expense';
import { getPaginationParams, PaginationOptions } from '../utils/paginate';

export const getExpenses = async (user: any, options?: PaginationOptions) => {
  if (!user.societyId) return [];

  const { limit, skip } = getPaginationParams(options);
  return await Expense.find({ societyId: user.societyId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const addExpense = async (data: any, user: any) => {
  const { title, amount, category } = data;

  if (!title || !amount || !category) {
    throw new Error('TITLE_AMOUNT_CATEGORY_REQUIRED');
  }

  if (!user.societyId) {
    throw new Error('ACCOUNT_NOT_LINKED_TO_SOCIETY');
  }

  if (Number(amount) <= 0) {
    throw new Error('AMOUNT_MUST_BE_POSITIVE');
  }

  const expense = await Expense.create({
    title,
    amount,
    category,
    societyId: user.societyId,
    recordedBy: user._id
  });

  return expense;
};

export const deleteExpense = async (expenseId: string, user: any) => {
  const expense = await Expense.findById(expenseId);

  if (!expense) {
    throw new Error('EXPENSE_NOT_FOUND');
  }

  if (expense.societyId.toString() !== user.societyId.toString()) {
    throw new Error('FORBIDDEN');
  }

  await expense.deleteOne();
  return expenseId;
};
