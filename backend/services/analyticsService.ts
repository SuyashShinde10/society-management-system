import mongoose from 'mongoose';
import User from '../models/User';
import MaintenanceBill from '../models/MaintenanceBill';
import Expense from '../models/Expense';
import Complaint from '../models/Complaint';
import { aiQueue } from '../workers/aiQueue';

export const getAdminAnalyticsData = async (societyId: string) => {
  const now = new Date();
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalMembers,
    billStats,
    expenseStats,
    totalComplaints,
    openComplaints,
    complaintsAggregation
  ] = await Promise.all([
    User.countDocuments({ societyId, role: 'member' }),
    MaintenanceBill.aggregate([
      { $match: { societyId: new mongoose.Types.ObjectId(societyId) } },
      { $facet: {
          revenue: [
            { $match: { isPaid: true, paidOn: { $exists: true, $ne: null } } },
            { $project: {
                amount: 1,
                paidOn: 1,
                isWeekly: { $gte: ["$paidOn", startOfWeek] },
                isMonthly: { $gte: ["$paidOn", startOfMonth] },
                isAnnual: { $gte: ["$paidOn", startOfYear] },
                month: { $month: "$paidOn" },
                year: { $year: "$paidOn" }
              }
            },
            { $group: {
                _id: null,
                revWeekly: { $sum: { $cond: ["$isWeekly", "$amount", 0] } },
                revMonthly: { $sum: { $cond: ["$isMonthly", "$amount", 0] } },
                revAnnual: { $sum: { $cond: ["$isAnnual", "$amount", 0] } },
                monthlyData: { $push: { month: "$month", year: "$year", amount: "$amount" } }
              }
            }
          ],
          pending: [
            { $match: { isPaid: false, status: 'Pending' } },
            { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } } }
          ]
        }
      }
    ]),
    Expense.aggregate([
      { $match: { societyId: new mongoose.Types.ObjectId(societyId) } },
      { $project: { amount: 1, expDate: { $ifNull: ["$expenseDate", "$createdAt"] } } },
      { $project: {
          amount: 1,
          expDate: 1,
          isWeekly: { $gte: ["$expDate", startOfWeek] },
          isMonthly: { $gte: ["$expDate", startOfMonth] },
          isAnnual: { $gte: ["$expDate", startOfYear] },
          month: { $month: "$expDate" },
          year: { $year: "$expDate" }
        }
      },
      { $group: {
          _id: null,
          expWeekly: { $sum: { $cond: ["$isWeekly", "$amount", 0] } },
          expMonthly: { $sum: { $cond: ["$isMonthly", "$amount", 0] } },
          expAnnual: { $sum: { $cond: ["$isAnnual", "$amount", 0] } },
          monthlyData: { $push: { month: "$month", year: "$year", amount: "$amount" } }
        }
      }
    ]),
    Complaint.countDocuments({ societyId }),
    Complaint.countDocuments({ societyId, status: { $ne: 'Resolved' } }),
    Complaint.aggregate([
      { $match: { societyId: new mongoose.Types.ObjectId(societyId) } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ])
  ]);

  const trendData: any[] = [];
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

  let revWeekly = 0, revMonthly = 0, revAnnual = 0;
  let pendingBillsCount = 0, pendingBillsAmount = 0;

  if (billStats[0].revenue[0]) {
    const rev = billStats[0].revenue[0];
    revWeekly = rev.revWeekly;
    revMonthly = rev.revMonthly;
    revAnnual = rev.revAnnual;
    rev.monthlyData.forEach((d: any) => {
      const trendItem = trendData.find(t => t.month === (d.month - 1) && t.year === d.year);
      if (trendItem) trendItem.revenue += d.amount;
    });
  }

  if (billStats[0].pending[0]) {
    pendingBillsCount = billStats[0].pending[0].count;
    pendingBillsAmount = billStats[0].pending[0].amount;
  }

  let expWeekly = 0, expMonthly = 0, expAnnual = 0;
  if (expenseStats[0]) {
    expWeekly = expenseStats[0].expWeekly;
    expMonthly = expenseStats[0].expMonthly;
    expAnnual = expenseStats[0].expAnnual;
    expenseStats[0].monthlyData.forEach((d: any) => {
      const trendItem = trendData.find(t => t.month === (d.month - 1) && t.year === d.year);
      if (trendItem) trendItem.expenses += d.amount;
    });
  }

  const complaintsByCategory = complaintsAggregation.map((c: any) => ({
    name: c._id || 'Uncategorized',
    value: c.count
  }));

  const pastMembers = 0; 

  return {
    totalMembers,
    pastMembers,
    revenue: { weekly: revWeekly, monthly: revMonthly, annual: revAnnual },
    pendingBills: { count: pendingBillsCount, amount: pendingBillsAmount },
    expenses: { weekly: expWeekly, monthly: expMonthly, annual: expAnnual },
    complaints: { total: totalComplaints, open: openComplaints },
    complaintsByCategory,
    trendData
  };
};

export const getMemberAnalyticsData = async (societyId: string, userId: string) => {
  const now = new Date();
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [totalMembers, userBills, userComplaints, openComplaints] = await Promise.all([
    User.countDocuments({ societyId, role: 'member' }),
    MaintenanceBill.find({ societyId, userId }),
    Complaint.countDocuments({ societyId, user: userId }),
    Complaint.countDocuments({ societyId, user: userId, status: { $ne: 'Resolved' } })
  ]);
  
  const memberPaymentData: any[] = [];
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
  
  let paidWeekly = 0, paidMonthly = 0, paidAnnual = 0, totalPaid = 0;
  let pendingAmount = 0;

  userBills.forEach((b: any) => {
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

  return {
    totalMembers,
    pastMembers: 0,
    myPayments: { weekly: paidWeekly, monthly: paidMonthly, annual: paidAnnual, total: totalPaid },
    pendingAmount,
    complaints: { total: userComplaints, open: openComplaints },
    memberPaymentData
  };
};

export const getPredictiveMaintenanceData = async (societyId: string) => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const complaints = await Complaint.find({
    societyId,
    createdAt: { $gte: threeMonthsAgo },
    category: { $in: ['Water', 'Electricity', 'Lift', 'Other'] }
  });

  if (complaints.length === 0) {
    return { status: 'no_data', analysis: 'Not enough historical data to generate predictive maintenance insights.' };
  }

  const complaintData = complaints.map(c => ({
    category: c.category,
    title: c.title,
    description: c.description,
    createdAt: c.createdAt
  }));

  const job = await aiQueue.add('predictiveMaintenance', {
    societyId,
    complaintData
  });
  
  return { status: 'started', jobId: job.id };
};

export const getSentimentAnalysisData = async (societyId: string) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const complaints = await Complaint.find({
    societyId,
    createdAt: { $gte: oneMonthAgo }
  });

  if (complaints.length === 0) {
    return { status: 'no_data', score: 100, explanation: "No complaints in the last month. Residents seem to be satisfied." };
  }

  const complaintData = complaints.map(c => c.description);

  const job = await aiQueue.add('sentimentAnalysis', {
    societyId,
    complaintData
  });
  
  return { status: 'started', jobId: job.id };
};
