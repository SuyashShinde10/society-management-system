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

      // Trend Data Initialization (Last 6 Months)
      const trendData = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        trendData.push({
          name: monthNames[d.getMonth()],
          month: d.getMonth(),
          year: d.getFullYear(),
          revenue: 0,
          expenses: 0
        });
      }

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

          const trendItem = trendData.find(t => t.month === paidDate.getMonth() && t.year === paidDate.getFullYear());
          if (trendItem) trendItem.revenue += b.amount;
        } else if (!b.isPaid && b.status === 'Pending') {
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

        const trendItem = trendData.find(t => t.month === expDate.getMonth() && t.year === expDate.getFullYear());
        if (trendItem) trendItem.expenses += e.amount;
      });

      // 4. Complaints
      const totalComplaints = await Complaint.countDocuments({ societyId });
      const openComplaints = await Complaint.countDocuments({ societyId, status: { $ne: 'Resolved' } });

      const pastMembers = 0; // Hardcoded to 0 for now as deleted members are hard deleted

      return res.json({
        totalMembers,
        pastMembers,
        revenue: { weekly: revWeekly, monthly: revMonthly, annual: revAnnual },
        pendingBills: { count: pendingBillsCount, amount: pendingBillsAmount },
        expenses: { weekly: expWeekly, monthly: expMonthly, annual: expAnnual },
        complaints: { total: totalComplaints, open: openComplaints },
        trendData
      });

    } else {
      // MEMBER ANALYTICS
      const totalMembers = await User.countDocuments({ societyId, role: 'member' });
      const pastMembers = 0;
      
      const memberPaymentData = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        memberPaymentData.push({
          name: monthNames[d.getMonth()],
          month: d.getMonth(),
          year: d.getFullYear(),
          amount: 0
        });
      }

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

          const trendItem = memberPaymentData.find(t => t.month === paidDate.getMonth() && t.year === paidDate.getFullYear());
          if (trendItem) trendItem.amount += b.amount;
        } else if (!b.isPaid && b.status === 'Pending') {
          pendingAmount += b.amount;
        }
      });

      const userComplaints = await Complaint.countDocuments({ societyId, user: userId });
      const openComplaints = await Complaint.countDocuments({ societyId, user: userId, status: { $ne: 'Resolved' } });

      return res.json({
        totalMembers,
        pastMembers,
        myPayments: { weekly: paidWeekly, monthly: paidMonthly, annual: paidAnnual, total: totalPaid },
        pendingAmount,
        complaints: { total: userComplaints, open: openComplaints },
        memberPaymentData
      });
    }
  } catch (error) {
    console.error('// ANALYTICS_ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

module.exports = { getAnalytics };
