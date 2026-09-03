import mongoose from 'mongoose';
import * as billService from '../../services/billService';
import MaintenanceBill from '../../models/MaintenanceBill';
import User from '../../models/User';
import Society from '../../models/Society';

describe('Concurrency & Double-Spend Prevention Unit Tests', () => {
  let societyId: mongoose.Types.ObjectId;
  let adminUser: any;
  let residentUser: any;
  let bill: any;

  beforeEach(async () => {
    societyId = new mongoose.Types.ObjectId();

    await Society.create({
      _id: societyId,
      name: 'Concurrency Test Society',
      regNumber: 'CONC-1234',
      address: '22 Concurrency Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      wings: ['A'],
      floors: 4,
    });

    residentUser = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan.concurrency@test.com',
      password: 'password123',
      role: 'member',
      societyId,
      isActive: true,
    });

    adminUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'admin',
      societyId,
    };

    bill = await MaintenanceBill.create({
      societyId,
      userId: residentUser._id,
      title: 'Quarterly Water & Lift Dues',
      amount: 4500,
      dueDate: new Date(Date.now() + 86400000),
      status: 'Pending',
      isPaid: false,
    });
  });

  it('should prevent double-settlement when two admin approvals run concurrently', async () => {
    const billId = bill._id.toString();

    // Fire two markBillPaid calls simultaneously using Promise.allSettled
    const [res1, res2] = await Promise.allSettled([
      billService.markBillPaid(billId, { paymentMode: 'UPI', action: 'approve' }, adminUser),
      billService.markBillPaid(billId, { paymentMode: 'Cash', action: 'approve' }, adminUser),
    ]);

    // Exactly one operation must succeed (fulfilled) and one must be rejected with BILL_ALREADY_PAID
    const fulfilled = [res1, res2].filter((r) => r.status === 'fulfilled');
    const rejected = [res1, res2].filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    if (rejected[0].status === 'rejected') {
      expect((rejected[0] as PromiseRejectedResult).reason.message).toBe('BILL_ALREADY_PAID');
    }

    // Database verification: bill should only be settled once
    const finalBill = await MaintenanceBill.findById(billId);
    expect(finalBill?.status).toBe('Paid');
    expect(finalBill?.isPaid).toBe(true);
  });

  it('should prevent duplicate member payment submissions on the same bill', async () => {
    const billId = bill._id.toString();

    const [res1, res2] = await Promise.allSettled([
      billService.markBillPaid(billId, { paymentMode: 'UPI' }, residentUser),
      billService.markBillPaid(billId, { paymentMode: 'Bank Transfer' }, residentUser),
    ]);

    const fulfilled = [res1, res2].filter((r) => r.status === 'fulfilled');
    const rejected = [res1, res2].filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const finalBill = await MaintenanceBill.findById(billId);
    expect(finalBill?.status).toBe('Under Verification');
  });
});
