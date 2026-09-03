import mongoose from 'mongoose';
import * as expenseService from '../../services/expenseService';
import Expense from '../../models/Expense';

describe('expenseService Unit Tests', () => {
  let societyId: mongoose.Types.ObjectId;
  let adminUser: any;

  beforeEach(() => {
    societyId = new mongoose.Types.ObjectId();
    adminUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'admin',
      societyId,
    };
  });

  describe('addExpense', () => {
    it('should create an expense when valid data is provided', async () => {
      const expense = await expenseService.addExpense(
        {
          title: 'Lift AMC Maintenance',
          amount: 12000,
          category: 'Repairs',
        },
        adminUser
      );

      expect(expense).toBeDefined();
      expect(expense.title).toBe('Lift AMC Maintenance');
      expect(expense.amount).toBe(12000);
      expect(expense.category).toBe('Repairs');
      expect(expense.societyId.toString()).toBe(societyId.toString());
    });

    it('should reject missing title or amount', async () => {
      await expect(
        expenseService.addExpense(
          {
            title: '',
            amount: 500,
            category: 'Utilities',
          },
          adminUser
        )
      ).rejects.toThrow('TITLE_AMOUNT_CATEGORY_REQUIRED');
    });

    it('should reject non-positive amount', async () => {
      await expect(
        expenseService.addExpense(
          {
            title: 'Water Tanker',
            amount: -100,
            category: 'Maintenance',
          },
          adminUser
        )
      ).rejects.toThrow('AMOUNT_MUST_BE_POSITIVE');
    });
  });

  describe('getExpenses & deleteExpense', () => {
    it('should fetch expenses scoped to the user society', async () => {
      await Expense.create([
        {
          title: 'Security Salaries',
          amount: 35000,
          category: 'Security',
          societyId,
          recordedBy: adminUser._id,
        },
        {
          title: 'Gardening Kit',
          amount: 2500,
          category: 'Maintenance',
          societyId,
          recordedBy: adminUser._id,
        },
      ]);

      const expenses = await expenseService.getExpenses(adminUser);
      expect(expenses.length).toBe(2);
      expect(expenses[0].societyId.toString()).toBe(societyId.toString());
    });

    it('should delete existing expense if authorized', async () => {
      const exp = await Expense.create({
        title: 'Generator Diesel',
        amount: 8000,
        category: 'Utilities',
        societyId,
        recordedBy: adminUser._id,
      });

      const deletedId = await expenseService.deleteExpense(exp._id.toString(), adminUser);
      expect(deletedId).toBe(exp._id.toString());

      const check = await Expense.findById(exp._id);
      expect(check).toBeNull();
    });
  });
});
