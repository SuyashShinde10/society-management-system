import Amenity from '../models/Amenity';
import AmenityBooking from '../models/AmenityBooking';
import Classified from '../models/Classified';
import Resolution from '../models/Resolution';
import User from '../models/User';
import logger from '../utils/logger';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import { emailQueue } from '../workers/emailQueue';

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

  // Send Amenity Booking Confirmation Email to Resident
  if (user.email) {
    try {
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const bookingEmailHtml = getProfessionalEmailTemplate({
        title: 'Clubhouse & Amenities',
        subtitle: 'AMENITY BOOKING CONFIRMED',
        greeting: `Hello ${user.name},`,
        bodyText: `Your reservation for <strong>${amenity.name}</strong> has been successfully confirmed.<br><br><strong>Slot Time:</strong> ${slotTime}<br><strong>Date:</strong> ${new Date(date).toDateString()}<br><strong>Attendees:</strong> ${requestedPeople} Person(s)<br>${totalAmount > 0 ? `<strong>Total Fees:</strong> ₹${totalAmount}` : '<strong>Charge:</strong> Complimentary Resident Amenity'}`,
        highlightBox: `${amenity.name}`,
        highlightBoxLabel: `${new Date(date).toDateString()} • ${slotTime}`,
        actionButton: {
          text: 'View My Bookings in Portal',
          url: `${appUrl}/resident`
        },
        warningText: 'Please adhere to society community guidelines and arrive on time for your reserved slot.',
        footerText: 'Society Amenities & Lifestyle Management'
      });

      await emailQueue.add('sendEmailJob', {
        email: user.email,
        subject: `Booking Confirmed: ${amenity.name} on ${new Date(date).toDateString()}`,
        html: bookingEmailHtml
      });
    } catch (err: any) {
      logger.error('// AMENITY_BOOKING_EMAIL_ERROR:', err.message);
    }
  }

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

  // Broadcast AGM Resolution email to all active members
  (async () => {
    try {
      const members = await User.find({ societyId: user.societyId, role: 'member', isActive: true }).select('email name');
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resolutionEmailHtml = getProfessionalEmailTemplate({
        title: 'Digital AGM & Governance',
        subtitle: 'NEW RESOLUTION OPEN FOR VOTING',
        greeting: 'Hello Resident,',
        bodyText: `A new society resolution has been posted for electronic voting by the management committee: "<strong>${title}</strong>".<br><br>${description ? `${description}<br><br>` : ''}Your participation is required to help achieve the required <strong>${quorumPercent || 50}%</strong> community quorum.`,
        highlightBox: `Voting Deadline: ${new Date(deadline).toDateString()}`,
        highlightBoxLabel: `Category: ${category || 'General'}`,
        actionButton: {
          text: 'Cast Your Vote in Portal',
          url: `${appUrl}/resident`
        },
        warningText: 'Every flat is allocated one vote. Please cast your ballot before the deadline.',
        footerText: 'Society Digital Governance & Democratic Voting'
      });

      for (const m of members) {
        if (m.email) {
          await emailQueue.add('sendEmailJob', {
            email: m.email,
            subject: `Digital AGM Vote: ${title}`,
            html: resolutionEmailHtml
          });
        }
      }
    } catch (err: any) {
      logger.error('// RESOLUTION_EMAIL_BROADCAST_ERROR:', err.message);
    }
  })();

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

  // Send digital vote receipt to resident
  if (user.email) {
    try {
      const selectedOptionText = resolution.options[optionIndex]?.text || `Option ${optionIndex + 1}`;
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const voteEmailHtml = getProfessionalEmailTemplate({
        title: 'Digital AGM & Governance',
        subtitle: 'VOTE CONFIRMATION RECEIPT',
        greeting: `Hello ${user.name || 'Resident'},`,
        bodyText: `Your digital ballot for resolution "<strong>${resolution.title}</strong>" has been successfully and securely recorded.<br><br><strong>Your Vote Choice:</strong> ${selectedOptionText}<br><strong>Timestamp:</strong> ${new Date().toLocaleString()}`,
        highlightBox: `Choice: ${selectedOptionText}`,
        highlightBoxLabel: `Recorded: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        actionButton: {
          text: 'View Real-Time Quorum & Tally',
          url: `${appUrl}/resident`
        },
        warningText: 'Your vote is confidential and legally binding in accordance with society bye-laws.',
        footerText: 'Society Digital Governance & Democratic Voting'
      });

      await emailQueue.add('sendEmailJob', {
        email: user.email,
        subject: `Vote Recorded: ${resolution.title}`,
        html: voteEmailHtml
      });
    } catch (err: any) {
      logger.error('// VOTE_CONFIRMATION_EMAIL_ERROR:', err.message);
    }
  }

  return resolution;
};

export const cancelAmenityBooking = async (bookingId: string, user: any) => {
  const query: any = { _id: bookingId, societyId: user.societyId };
  if (user.role === 'member') {
    query.residentId = user._id;
  }

  const booking = await AmenityBooking.findOne(query).populate('amenityId', 'name');
  if (!booking) throw new Error('BOOKING_NOT_FOUND');
  if (booking.status === 'Cancelled') throw new Error('BOOKING_ALREADY_CANCELLED');

  booking.status = 'Cancelled';
  await booking.save();

  logger.info(`[AMENITY CANCELLED] Booking ${bookingId} cancelled by ${user.name || user._id}`);

  // Send Booking Cancellation & Slot Released email
  const resident = await User.findById(booking.residentId).select('name email');
  if (resident && resident.email) {
    try {
      const amenityName = (booking.amenityId as any)?.name || 'Facility';
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const cancelHtml = getProfessionalEmailTemplate({
        title: 'Clubhouse & Amenities',
        subtitle: 'BOOKING CANCELLED & SLOT RELEASED',
        greeting: `Hello ${resident.name},`,
        bodyText: `Your reservation for <strong>${amenityName}</strong> on <strong>${new Date(booking.date).toDateString()} (${booking.slotTime})</strong> has been cancelled.<br><br>The slot has been released back into the resident booking pool.${booking.totalAmount > 0 ? `<br><br><strong>Refund Amount:</strong> ₹${booking.totalAmount} will be credited according to society cancellation terms.` : ''}`,
        highlightBox: `Status: Cancelled`,
        highlightBoxLabel: `${amenityName} • ${booking.slotTime}`,
        actionButton: {
          text: 'Book Alternative Time Slot',
          url: `${appUrl}/resident`
        },
        warningText: 'If you did not request this cancellation, please contact the society management office immediately.',
        footerText: 'Society Amenities & Lifestyle Management'
      });

      await emailQueue.add('sendEmailJob', {
        email: resident.email,
        subject: `Booking Cancelled: ${amenityName} on ${new Date(booking.date).toDateString()}`,
        html: cancelHtml
      });
    } catch (err: any) {
      logger.error('// AMENITY_CANCEL_EMAIL_ERROR:', err.message);
    }
  }

  return booking;
};
