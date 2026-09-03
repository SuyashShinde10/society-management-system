import * as visitorService from '../../services/visitorService';
import Visitor from '../../models/Visitor';
import User from '../../models/User';
import Society from '../../models/Society';
import mongoose from 'mongoose';
import { emailQueue } from '../../workers/emailQueue';

jest.spyOn(emailQueue, 'add').mockImplementation(async () => ({} as any));

jest.mock('../../utils/uploadCloudinary', () => ({
  uploadBase64ToCloudinary: jest.fn().mockResolvedValue('https://res.cloudinary.com/demo/visitor.png')
}));

describe('visitorService', () => {
  let mockSociety: any;
  let guardUser: any;
  let residentUser: any;

  beforeEach(async () => {
    mockSociety = await Society.create({
      name: 'Visitor Test Society',
      regNumber: `REG-VIS-${Date.now()}`,
      address: '789 Gate Road',
      wings: ['A'],
      floors: 4
    });

    guardUser = await User.create({
      name: 'Security Officer Dave',
      email: `guard_${Date.now()}@test.com`,
      password: 'password123',
      role: 'security',
      societyId: mockSociety._id
    });

    residentUser = await User.create({
      name: 'Alice Wonder',
      email: `alice_${Date.now()}@test.com`,
      password: 'password123',
      role: 'member',
      societyId: mockSociety._id,
      flatDetails: {
        wing: 'A',
        flatNumber: '101',
        residentType: 'Owner'
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkInVisitor', () => {
    it('should successfully check in a visitor', async () => {
      const visitorData = {
        name: 'Bob Delivery',
        phone: '9876543210',
        purpose: 'Package Delivery',
        wing: 'A',
        flatNumber: '101'
      };

      const visitor = await visitorService.checkInVisitor(visitorData, guardUser);

      expect(visitor).toBeDefined();
      expect(visitor.name).toBe('Bob Delivery');
      expect(visitor.status).toBe('Inside');
      expect(visitor.societyId.toString()).toBe(mockSociety._id.toString());
    });

    it('should throw error if name or phone or purpose is missing', async () => {
      await expect(
        visitorService.checkInVisitor({ name: 'Bob' }, guardUser)
      ).rejects.toThrow('MISSING_FIELDS');
    });
  });

  describe('checkOutVisitor', () => {
    it('should update status to CheckedOut and set checkout time', async () => {
      const visitor = await Visitor.create({
        name: 'Guest Tom',
        phone: '9876543211',
        purpose: 'Social Visit',
        societyId: mockSociety._id,
        enteredBy: guardUser._id,
        status: 'Inside'
      });

      const checkedOut = await visitorService.checkOutVisitor(
        (visitor._id as mongoose.Types.ObjectId).toString(),
        guardUser
      );

      expect(checkedOut.status).toBe('CheckedOut');
      expect(checkedOut.checkOutTime).toBeDefined();
    });
  });

  describe('getSocietyVisitors', () => {
    it('should return visitor logs for the society', async () => {
      await Visitor.create({
        name: 'Visitor 1',
        phone: '9998887771',
        purpose: 'Inspection',
        societyId: mockSociety._id,
        enteredBy: guardUser._id
      });

      const list = await visitorService.getSocietyVisitors(guardUser);
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Visitor 1');
    });
  });
});
