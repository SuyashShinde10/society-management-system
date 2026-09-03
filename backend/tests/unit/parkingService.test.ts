import mongoose from 'mongoose';
import * as parkingService from '../../services/parkingService';
import ParkingSpace from '../../models/ParkingSpace';
import User from '../../models/User';

describe('parkingService Unit Tests', () => {
  let societyId: string;
  let resident: any;

  beforeEach(async () => {
    societyId = new mongoose.Types.ObjectId().toString();

    resident = await User.create({
      name: 'Amit Patel',
      email: 'amit@test.com',
      password: 'password123',
      role: 'member',
      societyId,
      phone: '9876543210',
      isActive: true,
    });
  });

  describe('createParkingSpace', () => {
    it('should create a designated parking space with polygon coordinates', async () => {
      const space = await parkingService.createParkingSpace(
        {
          spaceNumber: 'B-101',
          allocatedTo: resident._id,
          vehicleNumber: 'MH12AB1234',
          coordinates: [
            [
              [73.85, 18.52],
              [73.86, 18.52],
              [73.86, 18.53],
              [73.85, 18.53],
              [73.85, 18.52],
            ],
          ],
        },
        societyId
      );

      expect(space).toBeDefined();
      expect(space.spaceNumber).toBe('B-101');
      expect(space.vehicleNumber).toBe('MH12AB1234');
      expect(space.societyId.toString()).toBe(societyId);
    });
  });

  describe('alprScan', () => {
    it('should authorize registered vehicle and return owner details', async () => {
      await ParkingSpace.create({
        societyId,
        spaceNumber: 'A-201',
        allocatedTo: resident._id,
        vehicleNumber: 'MH14XY9999',
        geoJSON: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
      });

      const result = await parkingService.alprScan('MH14XY9999', societyId);
      expect(result.authorized).toBe(true);
      expect(result.space).toBe('A-201');
      expect(result.owner).toBe('Amit Patel');
    });

    it('should deny entry to unregistered vehicle', async () => {
      const result = await parkingService.alprScan('DL01ZZ0000', societyId);
      expect(result.authorized).toBe(false);
      expect(result.message).toContain('Unauthorized Vehicle');
    });
  });
});
