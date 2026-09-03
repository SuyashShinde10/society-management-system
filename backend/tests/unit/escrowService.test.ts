import mongoose from 'mongoose';
import * as escrowService from '../../services/escrowService';
import EscrowAccount from '../../models/EscrowAccount';
import Society from '../../models/Society';
import Project from '../../models/Project';
import VendorQuote from '../../models/VendorQuote';

describe('escrowService Unit Tests', () => {
  let societyId: mongoose.Types.ObjectId;
  let projectId: mongoose.Types.ObjectId;
  let quoteId: mongoose.Types.ObjectId;
  let adminUser: any;
  let residentUser: any;

  beforeEach(async () => {
    societyId = new mongoose.Types.ObjectId();
    projectId = new mongoose.Types.ObjectId();
    quoteId = new mongoose.Types.ObjectId();

    // Create society with GeoJSON boundary
    await Society.create({
      _id: societyId,
      name: 'Escrow Test Society',
      regNumber: 'ESC-9988',
      address: '100 Green Park',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      wings: ['A', 'B'],
      floors: 5,
      geoJSON: {
        type: 'Polygon',
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
    });

    adminUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'admin',
      societyId,
    };

    residentUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'member',
      societyId,
    };
  });

  describe('createEscrow', () => {
    it('should create an escrow account with Held status', async () => {
      const escrow = await escrowService.createEscrow(
        {
          projectId,
          vendorQuoteId: quoteId,
          amount: 50000,
          societyId: societyId.toString(),
        },
        adminUser
      );

      expect(escrow).toBeDefined();
      expect(escrow.status).toBe('Held');
      expect(escrow.amount).toBe(50000);
      expect(escrow.geofenceVerified).toBe(false);
      expect(escrow.residentVerified).toBe(false);
    });

    it('should reject creation if admin attempts to create for another society', async () => {
      const otherSocietyId = new mongoose.Types.ObjectId();
      await expect(
        escrowService.createEscrow(
          {
            projectId,
            vendorQuoteId: quoteId,
            amount: 25000,
            societyId: otherSocietyId.toString(),
          },
          adminUser
        )
      ).rejects.toThrow('NOT_AUTHORIZED_SOCIETY');
    });
  });

  describe('verifyGeofence', () => {
    it('should verify contractor location if inside society coordinates', async () => {
      const escrow = await EscrowAccount.create({
        projectId,
        vendorQuoteId: quoteId,
        societyId,
        amount: 30000,
        status: 'Held',
      });

      // Point inside [73.855, 18.525]
      const verified = await escrowService.verifyGeofence(escrow._id.toString(), 18.525, 73.855);
      expect(verified.geofenceVerified).toBe(true);
      expect(verified.geofenceVerifiedAt).toBeDefined();
    });

    it('should reject verification if contractor location is outside coordinates', async () => {
      const escrow = await EscrowAccount.create({
        projectId,
        vendorQuoteId: quoteId,
        societyId,
        amount: 30000,
        status: 'Held',
      });

      // Point outside [73.95, 18.60]
      await expect(
        escrowService.verifyGeofence(escrow._id.toString(), 18.60, 73.95)
      ).rejects.toThrow('OUTSIDE_GEOFENCE');
    });
  });

  describe('verifyResident', () => {
    it('should mark residentVerified and release funds if geofence was already verified', async () => {
      const escrow = await EscrowAccount.create({
        projectId,
        vendorQuoteId: quoteId,
        societyId,
        amount: 45000,
        status: 'Held',
        geofenceVerified: true,
        geofenceVerifiedAt: new Date(),
      });

      const updated = await escrowService.verifyResident(escrow._id.toString(), residentUser);
      expect(updated.residentVerified).toBe(true);
      expect(updated.residentVerifiedAt).toBeDefined();
      expect(updated.status).toBe('Released');
    });
  });
});
