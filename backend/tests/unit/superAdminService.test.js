const superAdminService = require('../../services/superAdminService');
const Society = require('../../models/Society').default || require('../../models/Society');
const User = require('../../models/User').default || require('../../models/User');
const Notice = require('../../models/Notice').default || require('../../models/Notice');
const AuditLog = require('../../models/AuditLog').default || require('../../models/AuditLog');

describe('superAdminService', () => {
  let superAdminUser;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long-12345';

    superAdminUser = await User.create({
      name: 'Super Admin',
      email: `superadmin_${Date.now()}@test.com`,
      password: 'password123',
      role: 'superadmin'
    });
  });

  describe('getDashboardStats', () => {
    it('should return system-wide stats correctly', async () => {
      await Society.create({ name: 'Society 1', regNumber: `S1-${Date.now()}`, address: 'A1', wings: ['A'], floors: 4 });
      await Society.create({ name: 'Society 2', regNumber: `S2-${Date.now()}`, address: 'A2', wings: ['B'], floors: 5 });
      
      const stats = await superAdminService.getDashboardStats();

      expect(stats.stats.totalSocieties).toBe(2);
      expect(stats.societies.length).toBe(2);
    });
  });

  describe('suspendSociety', () => {
    it('should toggle society isActive status', async () => {
      const society = await Society.create({ name: 'Society 1', regNumber: `S1-${Date.now()}`, address: 'A1', wings: ['A'], floors: 4 });
      expect(society.isActive).toBe(true);

      const suspended = await superAdminService.suspendSociety(society._id.toString());
      expect(suspended.isActive).toBe(false);

      const activated = await superAdminService.suspendSociety(society._id.toString());
      expect(activated.isActive).toBe(true);
    });
  });

  describe('broadcastNotice', () => {
    it('should broadcast notice to all societies', async () => {
      const soc1 = await Society.create({ name: 'Society 1', regNumber: `S1-${Date.now()}`, address: 'A1', wings: ['A'], floors: 4 });
      const soc2 = await Society.create({ name: 'Society 2', regNumber: `S2-${Date.now()}`, address: 'A2', wings: ['B'], floors: 5 });

      await superAdminService.broadcastNotice({ title: 'Global Update', content: 'Maintenance at 10 PM' }, superAdminUser);

      const notices = await Notice.find({});
      expect(notices.length).toBe(2);
      expect(notices[0].title).toBe('[GLOBAL NOTICE] Global Update');
      expect(notices[1].title).toBe('[GLOBAL NOTICE] Global Update');
    });

    it('should throw error if title or content missing', async () => {
      await expect(superAdminService.broadcastNotice({ title: 'Global Update' }, superAdminUser)).rejects.toThrow('REQUIRED_FIELDS_MISSING');
    });
  });

  describe('impersonate', () => {
    it('should return target user and token for valid email', async () => {
      const email = `target_${Date.now()}@test.com`;
      const targetUser = await User.create({
        name: 'Target Admin',
        email,
        password: 'password123',
        role: 'admin'
      });

      const result = await superAdminService.impersonate(email, superAdminUser);

      expect(result.targetUser.email).toBe(email);
      expect(result.token).toBeDefined();

      const logs = await AuditLog.find({});
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('IMPERSONATE_USER');
    });

    it('should throw error for invalid email', async () => {
      await expect(superAdminService.impersonate('notfound@test.com', superAdminUser)).rejects.toThrow('USER_NOT_FOUND');
    });
  });
});
