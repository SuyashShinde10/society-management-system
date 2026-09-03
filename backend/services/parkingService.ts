import ParkingSpace from '../models/ParkingSpace';
import * as turf from '@turf/turf';
import logger from '../utils/logger';

export const createParkingSpace = async (data: any, societyId: string) => {
  const { spaceNumber, allocatedTo, coordinates, vehicleNumber } = data;

  const parkingSpace = new ParkingSpace({
    societyId,
    spaceNumber,
    allocatedTo,
    vehicleNumber,
    geoJSON: {
      type: 'Polygon',
      coordinates
    }
  });

  await parkingSpace.save();
  return parkingSpace;
};

export const enforceParking = async (latitude: number, longitude: number, vehicleNumber: string, societyId: string) => {
  const parkingSpaces = await ParkingSpace.find({ societyId }).populate('allocatedTo', 'name email phone');
  const point = turf.point([longitude, latitude]);
  let matchedSpace: any = null;

  for (const space of parkingSpaces) {
    const polygon = turf.polygon(space.geoJSON.coordinates as any);
    if (turf.booleanPointInPolygon(point, polygon)) {
      matchedSpace = space;
      break;
    }
  }

  if (!matchedSpace) {
    throw new Error('No parking space found at this location.');
  }

  if (matchedSpace.vehicleNumber === vehicleNumber) {
    return { status: 'OK', message: 'Vehicle is correctly parked in its allocated space.' };
  } else {
    const owner = matchedSpace.allocatedTo;
    const warningMessage = `ALERT: An unauthorized vehicle (${vehicleNumber || 'Unknown'}) is parked in your allocated space (${matchedSpace.spaceNumber}). Security has been notified.`;
    
    logger.info(`[WARNING DISPATCHED] To: ${owner ? owner.phone : 'Admin'} - ${warningMessage}`);

    return { 
      status: 'VIOLATION', 
      message: 'Violation detected. Warning dispatched.',
      space: matchedSpace.spaceNumber,
      owner: owner ? owner.name : 'Unallocated'
    };
  }
};

export const getAllParkingSpaces = async (societyId: string) => {
  return await ParkingSpace.find({ societyId }).populate('allocatedTo', 'name email');
};

export const alprScan = async (plateNumber: string, societyId: string) => {
  if (!plateNumber) throw new Error('Plate number is required');

  const space = await ParkingSpace.find({ 
    societyId, 
    vehicleNumber: { $regex: new RegExp(`^${plateNumber}$`, 'i') } 
  }).populate('allocatedTo', 'name');

  if (space && space.length > 0) {
    logger.info(`[ALPR SUCCESS] Verified vehicle ${plateNumber} (Owner: ${(space[0].allocatedTo as any)?.name}). Opening Boom Barrier...`);
    return {
      authorized: true,
      message: 'Vehicle Authorized. Boom Barrier Opened.',
      owner: (space[0].allocatedTo as any)?.name || 'Unknown',
      space: space[0].spaceNumber
    };
  } else {
    logger.info(`[ALPR REJECTED] Unknown vehicle ${plateNumber}. Barrier remains closed.`);
    return {
      authorized: false,
      message: 'Unauthorized Vehicle. Access Denied.'
    };
  }
};
