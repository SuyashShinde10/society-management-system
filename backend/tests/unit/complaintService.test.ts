import * as complaintService from '../../services/complaintService';
import Complaint from '../../models/Complaint';
import User from '../../models/User';
import Society from '../../models/Society';
import mongoose from 'mongoose';

jest.mock('../../services/emailService', () => ({
  sendComplaintNotificationToAdmins: jest.fn(),
  sendComplaintStatusUpdateToUser: jest.fn(),
}));

jest.mock('../../utils/uploadCloudinary', () => ({
  uploadBase64ToCloudinary: jest.fn().mockResolvedValue('https://res.cloudinary.com/demo/image.png'),
}));

describe('complaintService', () => {
  let mockSociety: any;
  let adminUser: any;
  let memberUser: any;

  beforeEach(async () => {
    mockSociety = await Society.create({
      name: 'Complaint Test Society',
      regNumber: `REG-COMP-${Date.now()}`,
      address: '456 Test Road',
      wings: ['A'],
      floors: 3
    });

    adminUser = await User.create({
      name: 'Admin Boss',
      email: `admin_${Date.now()}@complaint.com`,
      password: 'password123',
      role: 'admin',
      societyId: mockSociety._id
    });

    memberUser = await User.create({
      name: 'Resident John',
      email: `member_${Date.now()}@complaint.com`,
      password: 'password123',
      role: 'member',
      societyId: mockSociety._id,
      isActive: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addComplaint', () => {
    it('should create a new complaint with pending status', async () => {
      const complaintData = {
        title: 'Water Leakage in Wing A',
        description: 'Pipes are leaking on 2nd floor corridor.',
      };

      const complaint = await complaintService.addComplaint(complaintData, memberUser);

      expect(complaint).toBeDefined();
      expect(complaint.title).toBe('Water Leakage in Wing A');
      expect(complaint.status).toBe('Pending');
      expect(complaint.user.toString()).toBe(memberUser._id.toString());
    });

    it('should throw error when title or description is missing', async () => {
      await expect(complaintService.addComplaint({ title: '' }, memberUser)).rejects.toThrow('TITLE_AND_DESCRIPTION_REQUIRED');
    });
  });

  describe('getComplaints', () => {
    it('should retrieve complaints scoped to the user society', async () => {
      await Complaint.create({
        user: memberUser._id,
        societyId: mockSociety._id,
        title: 'Elevator Not Working',
        description: 'Elevator #2 is stuck.',
        status: 'Pending'
      });

      const result = await complaintService.getComplaints(memberUser, 10);
      expect(result.complaints.length).toBe(1);
      expect(result.complaints[0].title).toBe('Elevator Not Working');
      expect(result.total).toBe(1);
    });
  });

  describe('updateComplaintStatus', () => {
    it('should update complaint status to Resolved', async () => {
      const complaint = await Complaint.create({
        user: memberUser._id,
        societyId: mockSociety._id,
        title: 'Noise complaint',
        description: 'Loud music late at night',
        status: 'Pending'
      });

      const updated = await complaintService.updateComplaintStatus(
        (complaint._id as mongoose.Types.ObjectId).toString(),
        'Resolved',
        adminUser
      );

      expect(updated.status).toBe('Resolved');
    });

    it('should throw error for invalid status value', async () => {
      const complaint = await Complaint.create({
        user: memberUser._id,
        societyId: mockSociety._id,
        title: 'Test',
        description: 'Test',
        status: 'Pending'
      });

      await expect(
        complaintService.updateComplaintStatus((complaint._id as mongoose.Types.ObjectId).toString(), 'InvalidStatus', adminUser)
      ).rejects.toThrow('INVALID_STATUS_VALUE');
    });
  });

  describe('deleteComplaint', () => {
    it('should allow admin to delete a complaint', async () => {
      const complaint = await Complaint.create({
        user: memberUser._id,
        societyId: mockSociety._id,
        title: 'Old issue',
        description: 'Cleaned up',
        status: 'Resolved'
      });

      await complaintService.deleteComplaint((complaint._id as mongoose.Types.ObjectId).toString(), adminUser);
      const found = await Complaint.findById(complaint._id);
      expect(found).toBeNull();
    });

    it('should reject non-admin users from deleting another member complaint', async () => {
      const complaint = await Complaint.create({
        user: adminUser._id,
        societyId: mockSociety._id,
        title: 'Unauthorized delete attempt',
        description: 'Should fail',
        status: 'Pending'
      });

      await expect(
        complaintService.deleteComplaint((complaint._id as mongoose.Types.ObjectId).toString(), memberUser)
      ).rejects.toThrow('FORBIDDEN');
    });
  });

  describe('cross-tenant & authorization isolation', () => {
    let secondSociety: any;
    let foreignMember: any;
    let foreignAdmin: any;

    beforeEach(async () => {
      secondSociety = await Society.create({
        name: 'Foreign Society B',
        regNumber: `REG-FOREIGN-${Date.now()}`,
        address: '999 Foreign Way',
        wings: ['B1'],
        floors: 4
      });

      foreignMember = await User.create({
        name: 'Foreign Resident',
        email: `foreign_member_${Date.now()}@foreign.com`,
        password: 'password123',
        role: 'member',
        societyId: secondSociety._id,
        isActive: true
      });

      foreignAdmin = await User.create({
        name: 'Foreign Admin',
        email: `foreign_admin_${Date.now()}@foreign.com`,
        password: 'password123',
        role: 'admin',
        societyId: secondSociety._id
      });
    });

    it('should prevent Member A from seeing Member B complaints in the same society', async () => {
      const otherMember = await User.create({
        name: 'Other Resident',
        email: `other_${Date.now()}@complaint.com`,
        password: 'password123',
        role: 'member',
        societyId: mockSociety._id,
        isActive: true
      });

      await Complaint.create({
        user: otherMember._id,
        societyId: mockSociety._id,
        title: 'Private pipe issue',
        description: 'Inside my bathroom',
        status: 'Pending'
      });

      // memberUser queries complaints: should NOT see otherMember's complaint
      const memberResult = await complaintService.getComplaints(memberUser, 10);
      expect(memberResult.complaints.length).toBe(0);

      // adminUser queries complaints: SHOULD see complaints across members in the same society
      const adminResult = await complaintService.getComplaints(adminUser, 10);
      expect(adminResult.complaints.length).toBe(1);
      expect(adminResult.complaints[0].title).toBe('Private pipe issue');
    });

    it('should completely isolate complaints across different societies (tenants)', async () => {
      await Complaint.create({
        user: memberUser._id,
        societyId: mockSociety._id,
        title: 'Society A Issue',
        description: 'Specific to Society A',
        status: 'Pending'
      });

      // foreignMember & foreignAdmin from Society B must see 0 complaints from Society A
      const foreignMemberResult = await complaintService.getComplaints(foreignMember, 10);
      expect(foreignMemberResult.complaints.length).toBe(0);

      const foreignAdminResult = await complaintService.getComplaints(foreignAdmin, 10);
      expect(foreignAdminResult.complaints.length).toBe(0);
    });

    it('should block foreign admin from modifying status of a complaint in another society', async () => {
      const complaint = await Complaint.create({
        user: memberUser._id,
        societyId: mockSociety._id,
        title: 'Cross Tenant Breach Attempt',
        description: 'Foreign admin trying to update',
        status: 'Pending'
      });

      await expect(
        complaintService.updateComplaintStatus(
          (complaint._id as mongoose.Types.ObjectId).toString(),
          'Resolved',
          foreignAdmin
        )
      ).rejects.toThrow('FORBIDDEN');
    });

    it('should block foreign admin from deleting a complaint in another society', async () => {
      const complaint = await Complaint.create({
        user: memberUser._id,
        societyId: mockSociety._id,
        title: 'Cross Tenant Delete Attempt',
        description: 'Foreign admin trying to delete',
        status: 'Pending'
      });

      await expect(
        complaintService.deleteComplaint(
          (complaint._id as mongoose.Types.ObjectId).toString(),
          foreignAdmin
        )
      ).rejects.toThrow('FORBIDDEN');
    });
  });
});
