import Parcel from '../models/Parcel';
import Staff from '../models/Staff';
import StaffAttendance from '../models/StaffAttendance';
import GuestPass from '../models/GuestPass';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import { emailQueue } from '../workers/emailQueue';

// --- PARCEL WORKFLOW ---
export const logParcel = async (data: any, guardUser: any) => {
  const { carrier, trackingNumber, wing, flatNumber, notes } = data;
  const societyId = guardUser.societyId;

  // Attempt to find resident matching wing & flat
  const recipient = await User.findOne({
    societyId,
    role: 'member',
    $or: [
      { wing: { $regex: new RegExp(`^${wing}$`, 'i') }, flatNumber: { $regex: new RegExp(`^${flatNumber}$`, 'i') } },
      { 'flatDetails.wing': { $regex: new RegExp(`^${wing}$`, 'i') }, 'flatDetails.flatNumber': { $regex: new RegExp(`^${flatNumber}$`, 'i') } }
    ]
  }).select('_id name email');

  // Generate 4-digit claim OTP (raw — will be hashed by Parcel pre-save hook)
  const rawClaimOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const parcel = new Parcel({
    societyId,
    carrier,
    trackingNumber,
    recipientId: recipient ? recipient._id : null,
    wing,
    flatNumber,
    claimOtp: rawClaimOtp,
    status: 'At Gate',
    notes,
    loggedBy: guardUser._id
  });

  await parcel.save();
  logger.info(`[PARCEL LOGGED] Flat ${wing}-${flatNumber}, Carrier: ${carrier}`);

  // Send Parcel Delivery email notification to the resident
  if (recipient && recipient.email) {
    try {
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const parcelEmailHtml = getProfessionalEmailTemplate({
        title: 'Gate Security Locker',
        subtitle: 'PARCEL DELIVERED AT MAIN GATE',
        greeting: `Hello ${recipient.name},`,
        bodyText: `A delivery package from <strong>${carrier}</strong> has been logged by the security team for your unit (<strong>Wing ${wing} • Unit ${flatNumber}</strong>).${trackingNumber ? `<br><strong>Tracking / AWB:</strong> ${trackingNumber}` : ''}<br><br>Please provide the 4-digit Claim OTP below to the security desk guard when picking up your parcel.`,
        highlightBox: rawClaimOtp,
        highlightBoxLabel: 'Your 4-Digit Parcel Claim OTP',
        actionButton: {
          text: 'View Gate Locker',
          url: `${appUrl}/resident`
        },
        warningText: 'Do not share this OTP until you are physically receiving your parcel at the security desk.',
        footerText: 'Gate Security Automated Parcel System'
      });

      await emailQueue.add('sendEmailJob', {
        email: recipient.email,
        subject: `Delivery Alert: Parcel Arrived from ${carrier} (Claim OTP: ${rawClaimOtp})`,
        html: parcelEmailHtml
      });
    } catch (err: any) {
      logger.error('// PARCEL_EMAIL_ALERT_ERROR:', err.message);
    }
  }

  // Return parcel + rawClaimOtp so the caller can send it via SMS/notification.
  return { parcel, rawClaimOtp };
};

export const claimParcel = async (parcelId: string, claimOtp: string, guardUser: any) => {
  const parcel = await Parcel.findOne({ _id: parcelId, societyId: guardUser.societyId });
  if (!parcel) throw new Error('PARCEL_NOT_FOUND');
  if (parcel.status === 'Claimed') throw new Error('PARCEL_ALREADY_CLAIMED');

  const isOtpValid = await bcrypt.compare(claimOtp.trim(), parcel.claimOtp);
  if (!isOtpValid) throw new Error('INVALID_CLAIM_OTP');

  parcel.status = 'Claimed';
  parcel.claimedAt = new Date();
  await parcel.save();

  logger.info(`[PARCEL CLAIMED] Parcel ${parcelId} claimed successfully for ${parcel.wing}-${parcel.flatNumber}`);

  // Send Claim Confirmation email to resident
  if (parcel.recipientId) {
    try {
      const recipientUser = await User.findById(parcel.recipientId).select('name email');
      if (recipientUser && recipientUser.email) {
        const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const claimedEmailHtml = getProfessionalEmailTemplate({
          title: 'Gate Security Locker',
          subtitle: 'PARCEL PICKUP CONFIRMATION',
          greeting: `Hello ${recipientUser.name},`,
          bodyText: `Your delivery parcel from <strong>${parcel.carrier}</strong>${parcel.trackingNumber ? ` (Tracking: ${parcel.trackingNumber})` : ''} has been marked as <strong>Claimed</strong> and safely collected from the gate desk on <strong>${new Date().toLocaleString()}</strong>.`,
          highlightBox: 'Collected Successfully',
          highlightBoxLabel: 'Parcel Status',
          actionButton: {
            text: 'Open Resident Portal',
            url: `${appUrl}/resident`
          },
          footerText: 'Thank you for verifying your delivery with gate security.'
        });

        await emailQueue.add('sendEmailJob', {
          email: recipientUser.email,
          subject: `Parcel Claimed: ${parcel.carrier} Delivery Collected`,
          html: claimedEmailHtml
        });
      }
    } catch (err: any) {
      logger.error('// PARCEL_CLAIM_EMAIL_ERROR:', err.message);
    }
  }

  return parcel;
};

export const getMyParcels = async (user: any) => {
  if (user.role === 'member') {
    return await Parcel.find({
      societyId: user.societyId,
      $or: [
        { recipientId: user._id },
        { wing: user.wing, flatNumber: user.flatNumber }
      ]
    }).sort({ createdAt: -1 });
  }

  // Admin / Guard: get all active gate parcels
  return await Parcel.find({ societyId: user.societyId }).sort({ createdAt: -1 });
};

// --- DOMESTIC STAFF WORKFLOW ---
export const addStaff = async (data: any, user: any) => {
  const { name, phone, role, policeVerified, photoUrl, flatsAssigned } = data;
  const societyId = user.societyId;

  const staff = new Staff({
    societyId,
    name,
    phone,
    role,
    policeVerified: Boolean(policeVerified),
    photoUrl,
    flatsAssigned: flatsAssigned || []
  });

  await staff.save();
  return staff;
};

export const getAllStaff = async (societyId: string) => {
  const staffList = await Staff.find({ societyId }).sort({ name: 1 });
  
  // Attach current day status
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const activeAttendances = await StaffAttendance.find({
    societyId,
    entryTime: { $gte: startOfDay },
    status: 'Inside'
  });

  const insideStaffIds = new Set(activeAttendances.map(a => a.staffId.toString()));

  return staffList.map(staff => ({
    ...staff.toObject(),
    isCurrentlyInside: insideStaffIds.has(staff._id.toString())
  }));
};

export const checkInStaff = async (staffId: string, guardUser: any) => {
  const staff = await Staff.findOne({ _id: staffId, societyId: guardUser.societyId });
  if (!staff) throw new Error('STAFF_NOT_FOUND');

  // Check if already checked in today
  const activeAttendance = await StaffAttendance.findOne({
    societyId: guardUser.societyId,
    staffId,
    status: 'Inside'
  });

  if (activeAttendance) throw new Error('STAFF_ALREADY_INSIDE');

  const attendance = new StaffAttendance({
    societyId: guardUser.societyId,
    staffId,
    entryTime: new Date(),
    status: 'Inside',
    loggedBy: guardUser._id
  });

  await attendance.save();
  logger.info(`[STAFF CHECK-IN] ${staff.name} (${staff.role}) entered premises.`);
  return attendance;
};

export const checkOutStaff = async (staffId: string, guardUser: any) => {
  const attendance = await StaffAttendance.findOne({
    societyId: guardUser.societyId,
    staffId,
    status: 'Inside'
  }).sort({ entryTime: -1 });

  if (!attendance) throw new Error('STAFF_NOT_INSIDE');

  attendance.status = 'Exited';
  attendance.exitTime = new Date();
  await attendance.save();

  logger.info(`[STAFF CHECK-OUT] Staff ${staffId} exited premises.`);
  return attendance;
};

// --- PRE-APPROVED GUEST PASS WORKFLOW ---
export const createGuestPass = async (data: any, residentUser: any) => {
  const { guestName, guestPhone, purpose, validDate } = data;
  const societyId = residentUser.societyId;

  // Generate 6-digit numeric pass code (raw — will be hashed by GuestPass pre-save hook)
  const rawPassCode = Math.floor(100000 + Math.random() * 900000).toString();

  const pass = new GuestPass({
    societyId,
    residentId: residentUser._id,
    guestName,
    guestPhone,
    purpose: purpose || 'Guest',
    passCode: rawPassCode,
    validDate: validDate ? new Date(validDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'Active'
  });

  await pass.save();
  logger.info(`[GUEST PASS CREATED] For ${guestName}, Code: ${rawPassCode} by ${residentUser.name}`);

  // Send Guest Pass Details email to Resident
  if (residentUser.email) {
    try {
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const guestEmailHtml = getProfessionalEmailTemplate({
        title: 'Visitor Gate Pass',
        subtitle: 'PRE-APPROVED GUEST ENTRY PASS',
        greeting: `Hello ${residentUser.name},`,
        bodyText: `You have successfully created a pre-approved visitor entry pass for <strong>${guestName}</strong>${guestPhone ? ` (Phone: ${guestPhone})` : ''}.<br><br><strong>Purpose:</strong> ${purpose || 'Guest Visit'}<br><strong>Valid Until:</strong> ${pass.validDate.toDateString()}<br><br>Share the 6-digit entry code below with your visitor. They can show this code to the security guard at the gate for direct access.`,
        highlightBox: rawPassCode,
        highlightBoxLabel: '6-Digit Guest Entry Code',
        actionButton: {
          text: 'Manage Passes in Portal',
          url: `${appUrl}/resident`
        },
        warningText: 'This pass code is valid only for the designated date and one-time entry.',
        footerText: 'Gate Security Access Management'
      });

      await emailQueue.add('sendEmailJob', {
        email: residentUser.email,
        subject: `Guest Pass Created: ${guestName} (Pass Code: ${rawPassCode})`,
        html: guestEmailHtml
      });
    } catch (err: any) {
      logger.error('// GUEST_PASS_EMAIL_ERROR:', err.message);
    }
  }

  // Return pass with rawPassCode attached in memory so the caller can send/share it
  (pass as any).rawPassCode = rawPassCode;
  (pass as any).passCode = rawPassCode;
  return pass;
};

export const verifyGuestPass = async (passCode: string, guardUser: any) => {
  const activePasses = await GuestPass.find({
    societyId: guardUser.societyId,
    status: 'Active'
  }).populate('residentId', 'name email wing flatNumber phone');

  let matchingPass = null;
  const trimmedCode = passCode.trim();

  for (const p of activePasses) {
    const isMatch = await bcrypt.compare(trimmedCode, p.passCode);
    if (isMatch) {
      matchingPass = p;
      break;
    }
  }

  if (!matchingPass) throw new Error('INVALID_OR_EXPIRED_PASS');

  // Verify expiration date
  const now = new Date();
  if (now > new Date(matchingPass.validDate)) {
    matchingPass.status = 'Expired';
    await matchingPass.save();
    throw new Error('PASS_EXPIRED');
  }

  matchingPass.status = 'Used';
  matchingPass.verifiedAt = now;
  matchingPass.verifiedBy = guardUser._id;
  await matchingPass.save();

  logger.info(`[GUEST PASS VERIFIED] Guest: ${matchingPass.guestName}, Visiting: ${(matchingPass.residentId as any)?.name}`);

  // Send Guest Arrival Alert to Resident
  const resident = matchingPass.residentId as any;
  if (resident && resident.email) {
    try {
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const arrivalEmailHtml = getProfessionalEmailTemplate({
        title: 'Gate Security Alert',
        subtitle: 'GUEST ARRIVED AT MAIN GATE',
        greeting: `Hello ${resident.name},`,
        bodyText: `Your visitor <strong>${matchingPass.guestName}</strong> has successfully verified their guest pass code at the society gate and has been granted entry at <strong>${now.toLocaleTimeString()}</strong>.`,
        highlightBox: 'Visitor Entered Gate',
        highlightBoxLabel: `Guest: ${matchingPass.guestName}`,
        actionButton: {
          text: 'View Gate Passes',
          url: `${appUrl}/resident`
        },
        footerText: 'Automated Gate Security Notification'
      });

      await emailQueue.add('sendEmailJob', {
        email: resident.email,
        subject: `Gate Alert: Your guest ${matchingPass.guestName} has arrived`,
        html: arrivalEmailHtml
      });
    } catch (err: any) {
      logger.error('// GUEST_ARRIVAL_EMAIL_ERROR:', err.message);
    }
  }

  return matchingPass;
};

export const getMyGuestPasses = async (user: any) => {
  if (user.role === 'member') {
    return await GuestPass.find({ societyId: user.societyId, residentId: user._id }).sort({ createdAt: -1 });
  }
  return await GuestPass.find({ societyId: user.societyId }).populate('residentId', 'name wing flatNumber').sort({ createdAt: -1 });
};
