import User from '../models/User';
import Society from '../models/Society';
import Notice from '../models/Notice';
import MaintenanceBill from '../models/MaintenanceBill';
import Complaint from '../models/Complaint';
import Visitor from '../models/Visitor';
import Expense from '../models/Expense';
import AuditLog from '../models/AuditLog';
import SecurityAlert from '../models/SecurityAlert';
import SecurityStaff from '../models/SecurityStaff';
import EscrowAccount from '../models/EscrowAccount';
import ParkingSpace from '../models/ParkingSpace';
import Project from '../models/Project';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export const getDashboardStats = async () => {
  const totalSocieties = await Society.countDocuments();
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  const totalMembers = await User.countDocuments({ role: 'member' });
  
  // Fetch top 10 societies
  const societies = await Society.find().sort({ createdAt: -1 }).limit(10).populate('createdBy', 'name email');
  
  // Function to generate daily growth
  const getDailyGrowth = async (days: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const societyGrowth = await Society.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]);
    const memberGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate }, role: 'member' } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]);

    const data: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const sData = societyGrowth.find(g => g._id === dateStr);
      const mData = memberGrowth.find(g => g._id === dateStr);
      data.push({
        date: dateStr,
        label: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        societies: sData ? sData.count : 0,
        members: mData ? mData.count : 0
      });
    }
    return data;
  };

  // Function to generate monthly growth (for the year)
  const getYearlyGrowth = async () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1); // Start of that month
    
    const societyGrowth = await Society.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]);
    const memberGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate }, role: 'member' } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]);

    const data: any[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toISOString().split('T')[0].substring(0, 7); // YYYY-MM
      const sData = societyGrowth.find(g => g._id === monthStr);
      const mData = memberGrowth.find(g => g._id === monthStr);
      data.push({
        date: monthStr,
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        societies: sData ? sData.count : 0,
        members: mData ? mData.count : 0
      });
    }
    return data;
  };

  const growthDataWeek = await getDailyGrowth(7);
  const growthDataMonth = await getDailyGrowth(30);
  const growthDataYear = await getYearlyGrowth();

  return {
    stats: { totalSocieties, totalAdmins, totalMembers },
    societies,
    growthDataWeek,
    growthDataMonth,
    growthDataYear
  };
};

export const deleteSociety = async (id: string) => {
  await Society.findByIdAndUpdate(id, { deletedAt: new Date() });
  await User.updateMany({ societyId: id }, { deletedAt: new Date() });
  await Notice.deleteMany({ societyId: id });
  await MaintenanceBill.deleteMany({ societyId: id });
  await Complaint.deleteMany({ societyId: id });
  await Visitor.deleteMany({ societyId: id });
  await Expense.deleteMany({ societyId: id });
  await SecurityStaff.deleteMany({ societyId: id });
  await EscrowAccount.deleteMany({ societyId: id });
  await ParkingSpace.deleteMany({ societyId: id });
  await Project.deleteMany({ societyId: id });
};

export const suspendSociety = async (id: string) => {
  const society = await Society.findById(id);
  if (!society) throw new Error('NOT_FOUND');
  society.isActive = !society.isActive;
  await society.save();
  return society;
};

export const broadcastNotice = async (data: any, user: any) => {
  const { title, content } = data;
  if (!title || !content) throw new Error('REQUIRED_FIELDS_MISSING');

  const societies = await Society.find({});
  const noticesToCreate = societies.map(soc => ({
    title: `[GLOBAL NOTICE] ${title}`,
    content,
    societyId: soc._id,
    createdBy: user._id,
    priority: 'Urgent',
    targetType: 'All'
  }));

  if (noticesToCreate.length > 0) {
    await Notice.insertMany(noticesToCreate);
  }
};

export const getLogsAndAlerts = async () => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).populate('performedBy', 'name email role');
  const alerts = await SecurityAlert.find().sort({ createdAt: -1 }).limit(50);
  return { logs, alerts };
};

export const impersonate = async (email: string, user: any) => {
  if (!email) throw new Error('EMAIL_REQUIRED');
  
  const targetUser = await User.findOne({ email }).select('-password');
  if (!targetUser) throw new Error('USER_NOT_FOUND');
  
  // Generate token for target user but flag it as impersonated
  const token = jwt.sign(
    { id: targetUser._id, impersonatedBy: user._id, role: targetUser.role, societyId: targetUser.societyId },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );
  
  // Log this action
  await AuditLog.create({
    action: 'IMPERSONATE_USER',
    performedBy: user._id,
    targetId: targetUser._id,
    targetModel: 'User',
    details: { targetEmail: targetUser.email }
  });

  return { targetUser, token };
};

export const updatePlan = async (id: string, data: any, user: any) => {
  const { planType, additionalDays } = data;
  
  const society = await Society.findById(id);
  if (!society) throw new Error('NOT_FOUND');
  
  if (planType) society.planType = planType as any;
  if (additionalDays) {
    const currentExpiry = new Date(society.planExpiry || Date.now());
    currentExpiry.setDate(currentExpiry.getDate() + parseInt(additionalDays));
    society.planExpiry = currentExpiry;
  }
  
  await society.save();
  
  await AuditLog.create({
    action: 'UPDATE_SOCIETY_PLAN',
    performedBy: user._id,
    targetId: society._id,
    targetModel: 'Society',
    details: { planType: society.planType, newExpiry: society.planExpiry }
  });
  
  return society;
};

export const backupDatabase = async (user: any) => {
  // Basic JSON dump for disaster recovery
  const societies = await Society.find();
  const notices = await Notice.find();
  
  await AuditLog.create({
    action: 'DATABASE_BACKUP',
    performedBy: user._id
  });
  
  return { societies, notices, backupDate: new Date() };
};
