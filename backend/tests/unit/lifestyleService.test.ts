import mongoose from 'mongoose';
import * as lifestyleService from '../../services/lifestyleService';
import Amenity from '../../models/Amenity';
import AmenityBooking from '../../models/AmenityBooking';
import Resolution from '../../models/Resolution';
import User from '../../models/User';

describe('lifestyleService Unit Tests', () => {
  let societyId: mongoose.Types.ObjectId;
  let adminUser: any;
  let memberUser: any;

  beforeEach(() => {
    societyId = new mongoose.Types.ObjectId();
    adminUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'admin',
      societyId
    };
    memberUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Pooja V',
      role: 'member',
      societyId
    };
  });

  describe('Amenity Booking & Capacity Check', () => {
    it('should create an amenity and book a slot within capacity', async () => {
      const amenity = await lifestyleService.createAmenity(
        {
          name: 'Tennis Court',
          capacity: 4,
          pricePerSlot: 100,
          openTime: '06:00',
          closeTime: '21:00'
        },
        adminUser
      );

      const booking = await lifestyleService.bookAmenitySlot(
        {
          amenityId: amenity._id.toString(),
          date: '2026-09-10',
          slotTime: '07:00 - 08:00',
          numberOfPeople: 2
        },
        memberUser
      );

      expect(booking.status).toBe('Confirmed');
      expect(booking.totalAmount).toBe(200);
    });

    it('should reject booking if slot capacity is exceeded', async () => {
      const amenity = await lifestyleService.createAmenity(
        {
          name: 'Squash Court',
          capacity: 2,
          pricePerSlot: 50
        },
        adminUser
      );

      // Book full capacity
      await lifestyleService.bookAmenitySlot(
        {
          amenityId: amenity._id.toString(),
          date: '2026-09-10',
          slotTime: '08:00 - 09:00',
          numberOfPeople: 2
        },
        memberUser
      );

      // Attempt to book 1 more person
      await expect(
        lifestyleService.bookAmenitySlot(
          {
            amenityId: amenity._id.toString(),
            date: '2026-09-10',
            slotTime: '08:00 - 09:00',
            numberOfPeople: 1
          },
          memberUser
        )
      ).rejects.toThrow('CAPACITY_EXCEEDED');
    });
  });

  describe('Digital AGM & E-Voting', () => {
    it('should create a resolution and record confidential vote', async () => {
      const resolution = await lifestyleService.createResolution(
        {
          title: 'Solar Panel Installation on Clubhouse Roof',
          description: 'Approval of ₹5,00,000 capital expenditure from sinking fund.',
          category: 'Finance',
          quorumPercent: 50,
          deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          options: ['Approve', 'Reject', 'Abstain']
        },
        adminUser
      );

      expect(resolution.options).toHaveLength(3);

      const updated = await lifestyleService.castVote(
        resolution._id.toString(),
        0, // Approve
        memberUser
      );

      expect(updated.options[0].votesCount).toBe(1);
      expect(updated.voters).toHaveLength(1);

      // Second vote should fail
      await expect(
        lifestyleService.castVote(resolution._id.toString(), 1, memberUser)
      ).rejects.toThrow('ALREADY_VOTED');
    });
  });
});
