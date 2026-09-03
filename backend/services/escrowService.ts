import EscrowAccount from '../models/EscrowAccount';
import Society from '../models/Society';
import * as turf from '@turf/turf';
import withDistributedLock from '../utils/distributedLock';
import logger from '../utils/logger';

const checkAndReleaseFunds = async (escrow: any) => {
  return await withDistributedLock(`escrow:${escrow._id}`, 5000, async () => {
    if (escrow.geofenceVerified && escrow.residentVerified && escrow.status === 'Held') {
      const updated = await EscrowAccount.findOneAndUpdate(
        { _id: escrow._id, status: 'Held', geofenceVerified: true, residentVerified: true },
        { status: 'Released', releasedAt: new Date() },
        { returnDocument: 'after' }
      );
      if (updated) {
        escrow.status = 'Released';
        logger.info(`[ESCROW] Funds released for Escrow ID: ${escrow._id}`);
      }
    }
  });
};

export const getAllEscrows = async (user: any) => {
  let filter: any = {};
  if (user.role === 'admin') {
    if (!user.societyId) throw new Error('ADMIN_NO_SOCIETY');
    filter.societyId = user.societyId;
  }
  return await EscrowAccount.find(filter)
    .populate('projectId', 'title')
    .populate('vendorQuoteId', 'vendorName quoteAmount')
    .sort({ createdAt: -1 });
};

export const createEscrow = async (data: any, user: any) => {
  const { projectId, vendorQuoteId, amount, societyId } = data;
  
  if (user.role !== 'superadmin' && user.societyId && user.societyId.toString() !== societyId) {
    throw new Error('NOT_AUTHORIZED_SOCIETY');
  }
  
  const escrow = new EscrowAccount({
    projectId,
    vendorQuoteId,
    societyId,
    amount,
    status: 'Held'
  });
  
  await escrow.save();
  return escrow;
};

export const verifyGeofence = async (escrowId: string, latitude: number, longitude: number) => {
  const escrow = await EscrowAccount.findById(escrowId);
  if (!escrow) throw new Error('ESCROW_NOT_FOUND');
  
  const society = await Society.findById(escrow.societyId);
  if (!society || !society.geoJSON || !society.geoJSON.coordinates) {
    throw new Error('GEOFENCE_NOT_CONFIGURED');
  }

  const pt = turf.point([longitude, latitude]);
  const poly = turf.polygon(society.geoJSON.coordinates as any);

  if (turf.booleanPointInPolygon(pt, poly)) {
    escrow.geofenceVerified = true;
    escrow.geofenceVerifiedAt = new Date();
    await escrow.save();
    
    await checkAndReleaseFunds(escrow);
    return escrow;
  } else {
    throw new Error('OUTSIDE_GEOFENCE');
  }
};

export const verifyResident = async (escrowId: string, user: any) => {
  const escrow = await EscrowAccount.findById(escrowId);
  if (!escrow) throw new Error('ESCROW_NOT_FOUND');
  if (escrow.societyId.toString() !== user.societyId.toString()) {
    throw new Error('NOT_AUTHORIZED_SOCIETY');
  }

  escrow.residentVerified = true;
  escrow.residentVerifiedAt = new Date();
  escrow.residentId = user._id;
  await escrow.save();

  await checkAndReleaseFunds(escrow);
  return escrow;
};
