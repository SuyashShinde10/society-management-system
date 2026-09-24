import mongoose from 'mongoose';
import * as gateService from '../../services/gateService';
import Parcel from '../../models/Parcel';
import Staff from '../../models/Staff';
import GuestPass from '../../models/GuestPass';

describe('gateService Unit Tests', () => {
  let societyId: mongoose.Types.ObjectId;
  let guardUser: any;
  let residentUser: any;

  beforeEach(() => {
    societyId = new mongoose.Types.ObjectId();
    guardUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'security',
      societyId
    };
    residentUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Rohan Sharma',
      role: 'member',
      societyId,
      wing: 'A',
      flatNumber: '101'
    };
  });

  describe('Parcel Gate Locker', () => {
    it('should log a parcel and generate a hashed 4-digit claim OTP', async () => {
      const { parcel, rawClaimOtp } = await gateService.logParcel(
        {
          carrier: 'Amazon',
          trackingNumber: 'AMZ-123456',
          wing: 'A',
          flatNumber: '101',
          notes: 'Box with fragile tag'
        },
        guardUser
      );

      expect(parcel).toBeDefined();
      expect(parcel.status).toBe('At Gate');
      expect(parcel.carrier).toBe('Amazon');
      // rawClaimOtp is the 4-digit code sent to the resident
      expect(rawClaimOtp).toHaveLength(4);
      // DB must store the bcrypt hash, NOT plaintext
      expect(parcel.claimOtp).not.toBe(rawClaimOtp);
      expect(parcel.claimOtp.startsWith('$2')).toBe(true); // bcrypt prefix
    });

    it('should successfully claim parcel with correct OTP', async () => {
      const { parcel, rawClaimOtp } = await gateService.logParcel(
        {
          carrier: 'Flipkart',
          wing: 'A',
          flatNumber: '101'
        },
        guardUser
      );

      const claimed = await gateService.claimParcel(
        parcel._id.toString(),
        rawClaimOtp,   // use the raw OTP returned for verification
        guardUser
      );

      expect(claimed.status).toBe('Claimed');
      expect(claimed.claimedAt).toBeDefined();
    });

    it('should reject claim with invalid OTP', async () => {
      const { parcel } = await gateService.logParcel(
        {
          carrier: 'BlueDart',
          wing: 'A',
          flatNumber: '101'
        },
        guardUser
      );

      await expect(
        gateService.claimParcel(parcel._id.toString(), '0000', guardUser)
      ).rejects.toThrow('INVALID_CLAIM_OTP');
    });
  });

  describe('Domestic Staff Attendance', () => {
    it('should add staff and record daily check-in/check-out', async () => {
      const staff = await gateService.addStaff(
        {
          name: 'Sunita Bai',
          phone: '9876543210',
          role: 'Maid',
          policeVerified: true
        },
        guardUser
      );

      expect(staff.name).toBe('Sunita Bai');
      expect(staff.policeVerified).toBe(true);

      const checkIn = await gateService.checkInStaff(staff._id.toString(), guardUser);
      expect(checkIn.status).toBe('Inside');

      const checkOut = await gateService.checkOutStaff(staff._id.toString(), guardUser);
      expect(checkOut.status).toBe('Exited');
    });
  });

  describe('Pre-Approved Guest Pass', () => {
    it('should create a 6-digit pass and allow guard verification', async () => {
      const pass = await gateService.createGuestPass(
        {
          guestName: 'Karan Mehra',
          guestPhone: '9988776655',
          purpose: 'Dinner Guest'
        },
        residentUser
      );

      expect(pass.passCode).toHaveLength(6);
      expect(pass.status).toBe('Active');

      // Verify passCode in database is hashed with bcrypt, NOT plaintext
      const dbPass = await GuestPass.findById(pass._id);
      expect(dbPass?.passCode).toBeDefined();
      expect(dbPass?.passCode).not.toBe(pass.passCode);
      expect(dbPass?.passCode.startsWith('$2')).toBe(true);

      const verified = await gateService.verifyGuestPass(pass.passCode, guardUser);
      expect(verified.status).toBe('Used');
      expect(verified.verifiedAt).toBeDefined();
    });
  });
});
