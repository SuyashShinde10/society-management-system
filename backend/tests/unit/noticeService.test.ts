import mongoose from 'mongoose';
import * as noticeService from '../../services/noticeService';
import Notice from '../../models/Notice';
import User from '../../models/User';

jest.mock('../../utils/sendEmail', () => jest.fn().mockResolvedValue({ messageId: 'test-msg-id' }));

describe('noticeService Unit Tests', () => {
  let societyId: mongoose.Types.ObjectId;
  let adminUser: any;
  let memberUser: any;

  beforeEach(async () => {
    societyId = new mongoose.Types.ObjectId();
    adminUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'admin',
      societyId,
    };

    memberUser = await User.create({
      name: 'Priya Sharma',
      email: 'priya@test.com',
      password: 'hashedpassword',
      role: 'member',
      societyId,
      isActive: true,
    });
  });

  describe('addNotice', () => {
    it('should create general notice for all residents', async () => {
      const notice = await noticeService.addNotice(
        {
          title: 'Annual General Meeting (AGM)',
          content: 'All residents are invited to the clubhouse on Sunday at 10 AM.',
          targetType: 'All',
        },
        adminUser
      );

      expect(notice).toBeDefined();
      expect(notice.title).toBe('Annual General Meeting (AGM)');
      expect(notice.targetType).toBe('All');
      expect(notice.societyId.toString()).toBe(societyId.toString());
    });

    it('should create targeted notice for a specific user', async () => {
      const notice = await noticeService.addNotice(
        {
          title: 'Car Parking Reminder',
          content: 'Please park inside your assigned slot #24.',
          targetType: 'Specific',
          targetUserId: memberUser._id.toString(),
        },
        adminUser
      );

      expect(notice).toBeDefined();
      expect(notice.targetType).toBe('Specific');
      expect(notice.targetUserId.toString()).toBe(memberUser._id.toString());
    });

    it('should reject creation without title or content', async () => {
      await expect(
        noticeService.addNotice(
          {
            title: '',
            content: '',
          },
          adminUser
        )
      ).rejects.toThrow('TITLE_AND_CONTENT_REQUIRED');
    });
  });

  describe('getNotices & deleteNotice', () => {
    it('should filter notices correctly for members', async () => {
      await Notice.create([
        {
          title: 'Water Supply Shutdown',
          content: 'Tomorrow 2 PM to 5 PM',
          societyId,
          createdBy: adminUser._id,
          targetType: 'All',
        },
        {
          title: 'Private Dues Reminder',
          content: 'Pending payment notice',
          societyId,
          createdBy: adminUser._id,
          targetType: 'Specific',
          targetUserId: memberUser._id,
        },
        {
          title: 'Another Resident Private Notice',
          content: 'Notice for someone else',
          societyId,
          createdBy: adminUser._id,
          targetType: 'Specific',
          targetUserId: new mongoose.Types.ObjectId(),
        },
      ]);

      const notices = await noticeService.getNotices(memberUser);
      expect(notices.length).toBe(2);
      expect(notices.map((n: any) => n.title)).toContain('Water Supply Shutdown');
      expect(notices.map((n: any) => n.title)).toContain('Private Dues Reminder');
    });

    it('should allow admin to delete notice', async () => {
      const notice = await Notice.create({
        title: 'Outdated Notice',
        content: 'Old news',
        societyId,
        createdBy: adminUser._id,
        targetType: 'All',
      });

      const deletedId = await noticeService.deleteNotice(notice._id.toString(), adminUser);
      expect(deletedId).toBe(notice._id.toString());

      const found = await Notice.findById(notice._id);
      expect(found).toBeNull();
    });
  });
});
