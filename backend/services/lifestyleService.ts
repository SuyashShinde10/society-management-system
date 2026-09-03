import Amenity from '../models/Amenity';
import AmenityBooking from '../models/AmenityBooking';
import Classified from '../models/Classified';
import Resolution from '../models/Resolution';
import User from '../models/User';
import logger from '../utils/logger';

// --- AMENITIES & BOOKINGS ---
export const getAmenities = async (societyId: string) => {
  return await Amenity.find({ societyId, isActive: true }).sort({ name: 1 });
};

export const createAmenity = async (data: any, user: any) => {
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new Error('NOT_AUTHORIZED');
  }

  const amenity = new Amenity({
    ...data,
    societyId: user.societyId
  });

  await amenity.save();
  return amenity;
};

export const bookAmenitySlot = async (data: any, user: any) => {
  const { amenityId, date, slotTime, numberOfPeople, notes } = data;
  const societyId = user.societyId;

  const amenity = await Amenity.findOne({ _id: amenityId, societyId, isActive: true });
  if (!amenity) throw new Error('AMENITY_NOT_FOUND');

  // Check current bookings for this slot
  const existingBookings = await AmenityBooking.find({
    amenityId,
    date,
    slotTime,
    status: 'Confirmed'
  });

  const currentBookedCount = existingBookings.reduce((sum, b) => sum + (b.numberOfPeople || 1), 0);
  const requestedPeople = numberOfPeople || 1;

  if (currentBookedCount + requestedPeople > amenity.capacity) {
    throw new Error(`CAPACITY_EXCEEDED: Only ${Math.max(0, amenity.capacity - currentBookedCount)} spot(s) remaining for this slot.`);
  }

  const totalAmount = (amenity.pricePerSlot || 0) * requestedPeople;

  const booking = new AmenityBooking({
    societyId,
    amenityId,
    residentId: user._id,
    date,
    slotTime,
    numberOfPeople: requestedPeople,
    totalAmount,
    status: 'Confirmed',
    notes
  });

  await booking.save();
  logger.info(`[AMENITY BOOKED] ${amenity.name} for ${user.name} on ${date} @ ${slotTime}`);
  return booking;
};

export const getMyBookings = async (user: any) => {
  if (user.role === 'member') {
    return await AmenityBooking.find({ societyId: user.societyId, residentId: user._id })
      .populate('amenityId', 'name photoUrl pricePerSlot')
      .sort({ date: -1, slotTime: 1 });
  }
  return await AmenityBooking.find({ societyId: user.societyId })
    .populate('amenityId', 'name photoUrl')
    .populate('residentId', 'name wing flatNumber phone')
    .sort({ date: -1 });
};

// --- P2P CLASSIFIEDS & CARPOOL ---
export const createClassified = async (data: any, user: any) => {
  const classified = new Classified({
    ...data,
    societyId: user.societyId,
    authorId: user._id,
    status: 'Active'
  });

  await classified.save();
  return classified;
};

export const getClassifieds = async (societyId: string, category?: string) => {
  const filter: any = { societyId, status: 'Active' };
  if (category) filter.category = category;

  return await Classified.find(filter)
    .populate('authorId', 'name wing flatNumber phone')
    .sort({ createdAt: -1 });
};

// --- DIGITAL AGM & E-VOTING ---
export const createResolution = async (data: any, user: any) => {
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new Error('NOT_AUTHORIZED');
  }

  const { title, description, category, quorumPercent, deadline, options } = data;

  const resolution = new Resolution({
    societyId: user.societyId,
    title,
    description,
    category: category || 'General',
    quorumPercent: quorumPercent || 50,
    deadline: new Date(deadline),
    options: options.map((opt: string) => ({ text: opt, votesCount: 0 })),
    voters: [],
    status: 'Open',
    createdBy: user._id
  });

  await resolution.save();
  return resolution;
};

export const getResolutions = async (societyId: string) => {
  const totalResidents = await User.countDocuments({ societyId, role: 'member' });
  const resolutions = await Resolution.find({ societyId }).sort({ createdAt: -1 });

  return resolutions.map(res => {
    const votesCast = res.voters.length;
    const currentQuorumAchieved = totalResidents > 0 ? (votesCast / totalResidents) * 100 : 0;
    return {
      ...res.toObject(),
      totalResidents,
      votesCast,
      currentQuorumAchieved: parseFloat(currentQuorumAchieved.toFixed(1))
    };
  });
};

export const castVote = async (resolutionId: string, optionIndex: number, user: any) => {
  const resolution = await Resolution.findOne({ _id: resolutionId, societyId: user.societyId });
  if (!resolution) throw new Error('RESOLUTION_NOT_FOUND');
  if (resolution.status !== 'Open') throw new Error('VOTING_CLOSED');

  if (new Date() > new Date(resolution.deadline)) {
    resolution.status = 'Passed'; // Or calculate outcome
    await resolution.save();
    throw new Error('VOTING_DEADLINE_PASSED');
  }

  // Verify haven't voted
  const alreadyVoted = resolution.voters.some(v => v.residentId.toString() === user._id.toString());
  if (alreadyVoted) throw new Error('ALREADY_VOTED');

  if (optionIndex < 0 || optionIndex >= resolution.options.length) {
    throw new Error('INVALID_OPTION_INDEX');
  }

  resolution.options[optionIndex].votesCount += 1;
  resolution.voters.push({
    residentId: user._id,
    optionIndex,
    votedAt: new Date()
  });

  await resolution.save();
  logger.info(`[VOTE CAST] Resolution ${resolutionId}, Option ${optionIndex} by user ${user._id}`);
  return resolution;
};
