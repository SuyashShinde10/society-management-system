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
  });
});
