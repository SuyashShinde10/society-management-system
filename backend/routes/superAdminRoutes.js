const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  deleteSociety, 
  suspendSociety, 
  broadcastNotice,
  getLogsAndAlerts,
  impersonate,
  updatePlan,
  backupDatabase
} = require('../controllers/superAdminController');
const { protect, superadmin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, superadmin, getDashboardStats);
router.delete('/society/:id', protect, superadmin, deleteSociety);
router.patch('/society/:id/suspend', protect, superadmin, suspendSociety);
router.post('/broadcast', protect, superadmin, broadcastNotice);

router.get('/logs', protect, superadmin, getLogsAndAlerts);
router.post('/impersonate', protect, superadmin, impersonate);
router.patch('/society/:id/plan', protect, superadmin, updatePlan);
router.get('/backup', protect, superadmin, backupDatabase);

module.exports = router;
