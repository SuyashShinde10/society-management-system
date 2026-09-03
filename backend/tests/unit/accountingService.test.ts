import mongoose from 'mongoose';
import * as accountingService from '../../services/accountingService';
import MaintenanceBill from '../../models/MaintenanceBill';
import Expense from '../../models/Expense';
import SinkingFund from '../../models/SinkingFund';
import Society from '../../models/Society';

describe('accountingService Unit Tests', () => {
  let societyId: mongoose.Types.ObjectId;
  let adminUser: any;

  beforeEach(async () => {
    societyId = new mongoose.Types.ObjectId();
    adminUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'admin',
      societyId
    };

    await Society.create({
      _id: societyId,
      name: 'Gulmohar Heights CHS',
      regNumber: 'BOM/HSG/1234',
      address: 'Plot 42, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      wings: ['A', 'B'],
      floors: 7
    });

    await MaintenanceBill.create({
      societyId,
      userId: new mongoose.Types.ObjectId(),
      title: 'August 2026 Maintenance',
      amount: 4500,
      isPaid: true,
      status: 'Paid',
      dueDate: new Date(),
      lateFee: 0,
      aiDisputeStatus: 'None'
    });

    await Expense.create({
      societyId,
      title: 'Lift AMC August',
      amount: 12000,
      category: 'Maintenance',
      expenseDate: new Date()
    });
  });

  describe('Tally XML Export', () => {
    it('should generate valid Tally XML with sales and payment vouchers', async () => {
      const xml = await accountingService.generateTallyXML(societyId.toString());

      expect(xml).toContain('<ENVELOPE>');
      expect(xml).toContain('<TALLYREQUEST>Import Data</TALLYREQUEST>');
      expect(xml).toContain('<VOUCHER VCHTYPE="Sales" ACTION="Create">');
      expect(xml).toContain('<VOUCHER VCHTYPE="Payment" ACTION="Create">');
      expect(xml).toContain('Gulmohar Heights CHS');
      expect(xml).toContain('Society Maintenance Income');
    });
  });

  describe('Sinking Fund & Compound Interest Calculation', () => {
    it('should create an FD with accurate maturity calculations', async () => {
      const fund = await accountingService.createSinkingFund(
        {
          bankName: 'HDFC Bank',
          fdNumber: 'FD-99887766',
          principalAmount: 1000000, // 10 Lakhs
          interestRate: 7.5, // 7.5% per annum
          tenureMonths: 12,
          startDate: '2026-09-01',
          purpose: 'Lift Replacement'
        },
        adminUser
      );

      expect(fund.principalAmount).toBe(1000000);
      expect(fund.maturityAmount).toBeGreaterThan(1070000); // with quarterly compounding ~1,077,135
      expect(fund.status).toBe('Active');

      const overview = await accountingService.getSinkingFunds(societyId.toString());
      expect(overview.totalPrincipal).toBe(1000000);
      expect(overview.funds).toHaveLength(1);
    });
  });
});
