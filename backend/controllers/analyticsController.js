const mongoose = require('mongoose');
const User = require('../models/User');
const MaintenanceBill = require('../models/MaintenanceBill');
const Expense = require('../models/Expense');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Meeting = require('../models/Meeting');

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const societyId = req.user.societyId;

    const now = new Date();
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    if (role === 'admin') {
      // ADMIN ANALYTICS

      // 1. Members
      const totalMembers = await User.countDocuments({ societyId, role: 'member' });

      // 2. Revenue (Bills Paid)
      const allBills = await MaintenanceBill.find({ societyId });
      
      let revWeekly = 0, revMonthly = 0, revAnnual = 0;
      let pendingBillsCount = 0, pendingBillsAmount = 0;

      allBills.forEach(b => {
        if (b.isPaid && b.paidOn) {
          const paidDate = new Date(b.paidOn);
          if (paidDate >= startOfWeek) revWeekly += b.amount;
          if (paidDate >= startOfMonth) revMonthly += b.amount;
          if (paidDate >= startOfYear) revAnnual += b.amount;
        } else if (!b.isPaid) {
          pendingBillsCount++;
          pendingBillsAmount += b.amount;
        }
      });

      // 3. Expenses
      const allExpenses = await Expense.find({ societyId });
      
      let expWeekly = 0, expMonthly = 0, expAnnual = 0;

      allExpenses.forEach(e => {
        const expDate = new Date(e.expenseDate || e.createdAt);
        if (expDate >= startOfWeek) expWeekly += e.amount;
        if (expDate >= startOfMonth) expMonthly += e.amount;
        if (expDate >= startOfYear) expAnnual += e.amount;
      });

      // 4. Complaints
      const totalComplaints = await Complaint.countDocuments({ societyId });
      const openComplaints = await Complaint.countDocuments({ societyId, status: { $ne: 'Resolved' } });

      return res.json({
        totalMembers,
        revenue: { weekly: revWeekly, monthly: revMonthly, annual: revAnnual },
        pendingBills: { count: pendingBillsCount, amount: pendingBillsAmount },
        expenses: { weekly: expWeekly, monthly: expMonthly, annual: expAnnual },
        complaints: { total: totalComplaints, open: openComplaints }
      });

    } else {
      // MEMBER ANALYTICS
      const userBills = await MaintenanceBill.find({ societyId, userId });
      
      let paidWeekly = 0, paidMonthly = 0, paidAnnual = 0, totalPaid = 0;
      let pendingAmount = 0;

      userBills.forEach(b => {
        if (b.isPaid && b.paidOn) {
          const paidDate = new Date(b.paidOn);
          totalPaid += b.amount;
          if (paidDate >= startOfWeek) paidWeekly += b.amount;
          if (paidDate >= startOfMonth) paidMonthly += b.amount;
          if (paidDate >= startOfYear) paidAnnual += b.amount;
        } else if (!b.isPaid) {
          pendingAmount += b.amount;
        }
      });

      const userComplaints = await Complaint.countDocuments({ societyId, user: userId });
      const openComplaints = await Complaint.countDocuments({ societyId, user: userId, status: { $ne: 'Resolved' } });

      return res.json({
        myPayments: { weekly: paidWeekly, monthly: paidMonthly, annual: paidAnnual, total: totalPaid },
        pendingAmount,
        complaints: { total: userComplaints, open: openComplaints }
      });
    }
  } catch (error) {
    console.error('// ANALYTICS_ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

module.exports = { getAnalytics };
