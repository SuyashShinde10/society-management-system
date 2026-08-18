const User = require('../models/User');
const Society = require('../models/Society');
const Notice = require('../models/Notice');
const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');
const jwt = require('jsonwebtoken');

const getDashboardStats = async (req, res) => {
  try {
    const totalSocieties = await Society.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalMembers = await User.countDocuments({ role: 'member' });
    
    // Fetch top 10 societies
    const societies = await Society.find().sort({ createdAt: -1 }).limit(10).populate('createdBy', 'name email');
    
    // Function to generate daily growth
    const getDailyGrowth = async (days) => {
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

      const data = [];
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

      const data = [];
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

    res.json({
      stats: { totalSocieties, totalAdmins, totalMembers },
      societies,
      growthDataWeek,
      growthDataMonth,
      growthDataYear
    });
  } catch (error) {
    console.error('// SUPER_ADMIN_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const deleteSociety = async (req, res) => {
  try {
    const { id } = req.params;
    await Society.findByIdAndDelete(id);
    await User.deleteMany({ societyId: id });
    await Notice.deleteMany({ societyId: id });
    res.json({ message: 'SOCIETY_DELETED' });
  } catch (error) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const suspendSociety = async (req, res) => {
  try {
    const { id } = req.params;
    const society = await Society.findById(id);
    if (!society) return res.status(404).json({ message: 'NOT_FOUND' });
    society.isActive = !society.isActive;
    await society.save();
    res.json({ message: society.isActive ? 'SOCIETY_ACTIVATED' : 'SOCIETY_SUSPENDED', society });
  } catch (error) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const broadcastNotice = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'REQUIRED_FIELDS_MISSING' });

    const societies = await Society.find({});
    const noticesToCreate = societies.map(soc => ({
      title: `[GLOBAL NOTICE] ${title}`,
      content,
      societyId: soc._id,
      createdBy: req.user._id,
      priority: 'Urgent',
      targetType: 'All'
    }));

    if (noticesToCreate.length > 0) {
      await Notice.insertMany(noticesToCreate);
    }
    res.json({ message: 'NOTICE_BROADCASTED_SUCCESSFULLY' });
  } catch (error) {
    console.error('// BROADCAST_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const getLogsAndAlerts = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).populate('performedBy', 'name email role');
    const alerts = await SecurityAlert.find().sort({ createdAt: -1 }).limit(50);
    res.json({ logs, alerts });
  } catch (error) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const impersonate = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    
    const targetUser = await User.findOne({ email }).select('-password');
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    
    // Generate token for target user but flag it as impersonated
    const token = jwt.sign({ id: targetUser._id, impersonatedBy: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Log this action
    await AuditLog.create({
      action: 'IMPERSONATE_USER',
      performedBy: req.user._id,
      targetId: targetUser._id,
      targetModel: 'User',
      details: { targetEmail: targetUser.email }
    });

    res.json({ token, user: targetUser });
  } catch (error) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planType, additionalDays } = req.body;
    
    const society = await Society.findById(id);
    if (!society) return res.status(404).json({ message: 'Society not found' });
    
    if (planType) society.planType = planType;
    if (additionalDays) {
      const currentExpiry = new Date(society.planExpiry || Date.now());
      currentExpiry.setDate(currentExpiry.getDate() + parseInt(additionalDays));
      society.planExpiry = currentExpiry;
    }
    
    await society.save();
    
    await AuditLog.create({
      action: 'UPDATE_SOCIETY_PLAN',
      performedBy: req.user._id,
      targetId: society._id,
      targetModel: 'Society',
      details: { planType: society.planType, newExpiry: society.planExpiry }
    });
    
    res.json({ message: 'Plan updated successfully', society });
  } catch (error) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const backupDatabase = async (req, res) => {
  try {
    // Basic JSON dump for disaster recovery
    const societies = await Society.find();
    const users = await User.find().select('-password'); // Exclude passwords for safety
    const notices = await Notice.find();
    
    await AuditLog.create({
      action: 'DATABASE_BACKUP',
      performedBy: req.user._id
    });
    
    res.json({ societies, users, notices, backupDate: new Date() });
  } catch (error) {
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = {
  getDashboardStats,
  deleteSociety,
  suspendSociety,
  broadcastNotice,
  getLogsAndAlerts,
  impersonate,
  updatePlan,
  backupDatabase
};
