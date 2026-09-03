const billService = require('../../services/billService');
const MaintenanceBill = require('../../models/MaintenanceBill').default || require('../../models/MaintenanceBill');
const User = require('../../models/User').default || require('../../models/User');
const Society = require('../../models/Society').default || require('../../models/Society');
const { emailQueue } = require('../../workers/emailQueue');

jest.mock('../../services/paymentService', () => ({
  createCheckoutSession: jest.fn().mockResolvedValue('http://mock-checkout.url'),
  verifyPayment: jest.fn()
}));

describe('billService', () => {
  let mockSociety, adminUser, memberUser;

  beforeEach(async () => {
    jest.spyOn(emailQueue, 'add').mockImplementation(async () => ({}));

    mockSociety = await Society.create({
      name: 'Test Society',
      regNumber: `REG-BILL-${Date.now()}`,
      address: 'Test Address',
      wings: ['A', 'B'],
      floors: 5
    });

    adminUser = await User.create({
      name: 'Admin',
      email: `admin_${Date.now()}@test.com`,
      password: 'password123',
      role: 'admin',
      societyId: mockSociety._id
    });

    memberUser = await User.create({
      name: 'Member',
      email: `member_${Date.now()}@test.com`,
      password: 'password123',
      role: 'member',
      societyId: mockSociety._id,
      isActive: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateBills', () => {
    it('should generate bills for all members successfully', async () => {
      const data = {
        title: 'Monthly Maintenance',
        description: 'July Maintenance',
        amount: 2000,
        targetType: 'All'
      };

      const result = await billService.generateBills(data, adminUser);

      expect(result.bills.length).toBe(1);
      expect(result.bills[0].title).toBe('Monthly Maintenance');
      expect(result.bills[0].userId.toString()).toBe(memberUser._id.toString());
      expect(emailQueue.add).toHaveBeenCalled();
    });

    it('should throw error if title or amount is missing', async () => {
      await expect(billService.generateBills({ title: 'Test' }, adminUser)).rejects.toThrow('TITLE_AND_AMOUNT_REQUIRED');
    });
  });

  describe('markBillPaid', () => {
    it('should mark bill as paid by admin', async () => {
      const bill = await MaintenanceBill.create({
        societyId: mockSociety._id,
        userId: memberUser._id,
        title: 'Maintenance',
        amount: 1000,
        status: 'Pending',
        isPaid: false
      });

      const updatedBill = await billService.markBillPaid(bill._id.toString(), { action: 'approve' }, adminUser);

      expect(updatedBill.isPaid).toBe(true);
      expect(updatedBill.status).toBe('Paid');
    });

    it('should allow member to mark bill under verification', async () => {
      const bill = await MaintenanceBill.create({
        societyId: mockSociety._id,
        userId: memberUser._id,
        title: 'Maintenance',
        amount: 1000,
        status: 'Pending',
        isPaid: false
      });

      const updatedBill = await billService.markBillPaid(bill._id.toString(), { paymentMode: 'UPI' }, memberUser);

      expect(updatedBill.status).toBe('Under Verification');
      expect(updatedBill.isPaid).toBe(false);
    });
  });

  describe('deleteBill', () => {
    it('should delete bill successfully', async () => {
      const bill = await MaintenanceBill.create({
        societyId: mockSociety._id,
        userId: memberUser._id,
        title: 'Maintenance',
        amount: 1000
      });

      await billService.deleteBill(bill._id.toString(), adminUser);
      const found = await MaintenanceBill.findById(bill._id);
      expect(found).toBeNull();
    });
  });
});
