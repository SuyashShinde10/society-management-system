import MaintenanceBill from '../models/MaintenanceBill';
import User from '../models/User';
import Society from '../models/Society';
import { emailQueue } from '../workers/emailQueue';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import { createCheckoutSession, verifyPayment } from '../services/paymentService';
import { IGenerateBillInput, IMarkBillPaidInput, IAuthUserContext } from '../types';
import withDistributedLock from '../utils/distributedLock';
import logger from '../utils/logger';

export const generateBills = async (data: IGenerateBillInput, user: IAuthUserContext) => {
  const { title, description, amount, dueDate, targetType, targetUserId } = data;

  if (!title || !amount) {
    throw new Error('TITLE_AND_AMOUNT_REQUIRED');
  }

  const society = await Society.findById(user.societyId);
  if (!society) throw new Error('SOCIETY_NOT_FOUND');

  let members = [];
  if (targetType === 'Specific') {
    if (!targetUserId) throw new Error('TARGET_USER_REQUIRED');
    const targetUser = await User.findOne({ _id: targetUserId, societyId: user.societyId, role: 'member' });
    if (!targetUser) throw new Error('MEMBER_NOT_FOUND');
    members.push(targetUser);
  } else {
    members = await User.find({ societyId: user.societyId, role: 'member', isActive: true });
  }

  const bills = [];
  const errors = [];
  
  const billDocs = members.map(member => ({
    societyId: user.societyId,
    userId: member._id,
    title,
    description,
    amount: Number(amount),
    dueDate: dueDate ? new Date(dueDate) : null,
  }));

  try {
    const insertedBills = await MaintenanceBill.insertMany(billDocs);
    bills.push(...insertedBills);

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const emailPromises = members.map(member => {
      const html = getProfessionalEmailTemplate({
        title: 'Maintenance Invoice',
        subtitle: 'NEW MAINTENANCE BILL ISSUED',
        greeting: `Hello ${member.name},`,
        bodyText: `A new maintenance invoice for "<strong>${title}</strong>" amounting to <strong>₹${amount}</strong> has been generated for your unit.<br><br>Please clear your dues on or before the due date to ensure uninterrupted society amenities and avoid late fees.`,
        highlightBox: `₹${amount}`,
        highlightBoxLabel: `Due Date: ${dueDate ? new Date(dueDate).toDateString() : 'Immediate'}`,
        actionButton: {
          text: 'Pay Maintenance Online',
          url: `${appUrl}/resident`
        },
        warningText: 'Late payment charges may be levied on dues unpaid past the due date.',
        footerText: 'Society Accounts & Billing Department'
      });

      return emailQueue.add('sendEmailJob', {
        email: member.email,
        subject: `New Maintenance Bill: ${title} (₹${amount})`,
        html
      });
    });

    await Promise.allSettled(emailPromises);
  } catch (err: any) {
    logger.error('Failed to generate some bills:', err);
    errors.push(err.message);
  }

  return { bills, errors };
};

export const getBills = async (user: IAuthUserContext, cursor?: string) => {
  const filter: any = { societyId: user.societyId };

  if (user.role === 'member') {
    filter.userId = user._id;
  }

  const limit = 20;
  if (cursor) {
    filter._id = { $lt: cursor };
  }

  const bills = await MaintenanceBill.find(filter)
    .populate('userId', 'name flatDetails')
    .sort({ _id: -1 })
    .limit(limit);

  const nextCursor = bills.length === limit ? bills[bills.length - 1]._id : null;
  return { bills, nextCursor };
};

export const markBillPaid = async (billId: string, data: IMarkBillPaidInput, user: IAuthUserContext) => {
  return await withDistributedLock(`bill:${billId}`, 5000, async () => {
    const { paymentMode, notes, action } = data;

    const bill = await MaintenanceBill.findById(billId);
    if (!bill) throw new Error('BILL_NOT_FOUND');

    if (bill.societyId.toString() !== user.societyId?.toString()) {
      throw new Error('FORBIDDEN');
    }

    if (user.role !== 'admin' && bill.userId.toString() !== user._id.toString()) {
      throw new Error('NOT_YOUR_BILL');
    }

    const updateData: any = {};
    let queryFilter: any = { _id: billId };

    if (user.role === 'admin') {
      if (action === 'reject') {
        if (bill.status === 'Pending') throw new Error('BILL_ALREADY_PENDING');
        updateData.status = 'Pending';
        updateData.paymentMode = null;
        updateData.isPaid = false;
        queryFilter.status = 'Under Verification';
      } else {
        if (bill.isPaid || bill.status === 'Paid') throw new Error('BILL_ALREADY_PAID');
        updateData.isPaid = true;
        updateData.status = 'Paid';
        updateData.paidOn = new Date();
        updateData.paymentMode = paymentMode || bill.paymentMode || 'Cash';
        updateData.markedPaidBy = user._id;
        queryFilter.isPaid = false;
      }
    } else {
      // Member submission
      if (bill.isPaid || bill.status === 'Paid') throw new Error('BILL_ALREADY_PAID');
      if (bill.status === 'Under Verification') throw new Error('ALREADY_UNDER_VERIFICATION');
      
      updateData.status = 'Under Verification';
      updateData.paymentMode = paymentMode || 'UPI';
      queryFilter.isPaid = false;
      queryFilter.status = { $ne: 'Under Verification' };
    }

    if (notes) updateData.notes = notes;

    const updatedBill = await MaintenanceBill.findOneAndUpdate(queryFilter, updateData, { returnDocument: 'after' }).populate('userId', 'name email');
    
    if (!updatedBill) {
      if (user.role === 'admin' && action !== 'reject') {
        throw new Error('BILL_ALREADY_PAID');
      } else if (user.role !== 'admin') {
        throw new Error('ALREADY_UNDER_VERIFICATION');
      }
      throw new Error('BILL_NOT_FOUND');
    }

    if (updatedBill && updatedBill.status === 'Paid' && updatedBill.userId && (updatedBill.userId as any).email) {
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const html = getProfessionalEmailTemplate({
        title: 'Payment Receipt',
        subtitle: 'OFFICIAL SOCIETY PAYMENT RECEIPT',
        greeting: `Hello ${(updatedBill.userId as any).name},`,
        bodyText: `Your maintenance payment of <strong>₹${updatedBill.amount}</strong> for "<strong>${updatedBill.title}</strong>" has been successfully received and verified via <strong>${updatedBill.paymentMode || 'Online'}</strong> on <strong>${new Date().toLocaleDateString()}</strong>.<br><br>The official transaction record has been archived in your resident financial ledger.`,
        highlightBox: `₹${updatedBill.amount}`,
        highlightBoxLabel: `Paid via ${updatedBill.paymentMode || 'Online'} • Status: Paid`,
        actionButton: {
          text: 'View Ledger & History',
          url: `${appUrl}/resident`
        },
        footerText: 'Thank you for your timely contribution towards society maintenance.'
      });

      emailQueue.add('sendEmailJob', {
        email: (updatedBill.userId as any).email,
        subject: `Payment Receipt: ${updatedBill.title} (₹${updatedBill.amount})`,
        html
      });
    }

    return updatedBill;
  });
};

export const deleteBill = async (billId: string, user: IAuthUserContext) => {
  const bill = await MaintenanceBill.findById(billId);
  if (!bill) throw new Error('BILL_NOT_FOUND');

  if (bill.societyId.toString() !== user.societyId?.toString()) {
    throw new Error('FORBIDDEN');
  }

  await bill.deleteOne();
  return billId;
};

export const createCheckout = async (billId: string, user: IAuthUserContext) => {
  const bill = await MaintenanceBill.findById(billId);
  if (!bill) throw new Error('BILL_NOT_FOUND');

  if (bill.societyId.toString() !== user.societyId?.toString()) {
    throw new Error('FORBIDDEN');
  }

  if (bill.isPaid) throw new Error('BILL_ALREADY_PAID');
  
  const sessionUrl = await createCheckoutSession(bill, user);
  return sessionUrl;
};

export const verifyStripePaymentData = async (sessionId: string) => {
  if (!sessionId) throw new Error('SESSION_ID_REQUIRED');

  const paymentInfo = await verifyPayment(sessionId);

  if (paymentInfo.isPaid && paymentInfo.billId) {
    // CRITICAL: Stripe can deliver webhooks multiple times.
    // The distributed lock (keyed by Stripe session ID) makes this handler idempotent —
    // only the first concurrent invocation proceeds; subsequent ones get a 409.
    return await withDistributedLock(`stripe:${sessionId}`, 10000, async () => {
      const bill = await MaintenanceBill.findOneAndUpdate(
        { _id: paymentInfo.billId, isPaid: false }, // atomic guard — only updates if not already paid
        { isPaid: true, status: 'Paid', paymentMode: 'Stripe', paidOn: new Date() },
        { returnDocument: 'after' }
      );

      if (!bill) {
        // Either already paid (idempotent — not an error) or bill not found
        const existing = await MaintenanceBill.findById(paymentInfo.billId);
        if (existing?.isPaid) return existing; // already processed, return stable state
        throw new Error('BILL_NOT_FOUND');
      }

      return bill;
    });
  }
  throw new Error('PAYMENT_NOT_VERIFIED');
};

export const sendDueReminders = async (societyId: string) => {
  const pendingBills = await MaintenanceBill.find({
    societyId,
    status: 'Pending',
    isPaid: false
  }).populate('userId', 'name email');

  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  let sentCount = 0;

  for (const b of pendingBills) {
    const u = b.userId as any;
    if (u && u.email) {
      const dueStr = b.dueDate ? new Date(b.dueDate).toDateString() : 'Immediate';
      const html = getProfessionalEmailTemplate({
        title: 'Maintenance Reminder',
        subtitle: 'BILL PAYMENT REMINDER',
        greeting: `Hello ${u.name},`,
        bodyText: `This is a reminder that your maintenance bill for "<strong>${b.title}</strong>" amounting to <strong>₹${b.amount}</strong> is currently pending.<br><br>Please clear this payment on or before <strong>${dueStr}</strong> to avoid late fee penalties.`,
        highlightBox: `₹${b.amount}`,
        highlightBoxLabel: `Due Date: ${dueStr}`,
        actionButton: {
          text: 'Pay Maintenance Online',
          url: `${appUrl}/resident`
        },
        warningText: 'Late payment charges will apply to dues remaining unpaid after the due date.',
        footerText: 'Society Accounts & Billing Department'
      });

      await emailQueue.add('sendEmailJob', {
        email: u.email,
        subject: `Payment Reminder: ${b.title} (Due: ${dueStr})`,
        html
      });
      sentCount++;
    }
  }

  return { success: true, count: sentCount };
};
