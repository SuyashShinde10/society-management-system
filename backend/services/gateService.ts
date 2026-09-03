import Parcel from '../models/Parcel';
import Staff from '../models/Staff';
import StaffAttendance from '../models/StaffAttendance';
import GuestPass from '../models/GuestPass';
import User from '../models/User';
import logger from '../utils/logger';

// --- PARCEL WORKFLOW ---
export const logParcel = async (data: any, guardUser: any) => {
  const { carrier, trackingNumber, wing, flatNumber, notes } = data;
  const societyId = guardUser.societyId;

  // Attempt to find resident matching wing & flat
  const recipient = await User.findOne({
    societyId,
    role: 'member',
    wing: { $regex: new RegExp(`^${wing}$`, 'i') },
    flatNumber: { $regex: new RegExp(`^${flatNumber}$`, 'i') }
  });

  // Generate 4-digit claim OTP
  const claimOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const parcel = new Parcel({
    societyId,
    carrier,
    trackingNumber,
    recipientId: recipient ? recipient._id : null,
    wing,
    flatNumber,
    claimOtp,
    status: 'At Gate',
    notes,
    loggedBy: guardUser._id
  });

  await parcel.save();
  logger.info(`[PARCEL LOGGED] Flat ${wing}-${flatNumber}, Carrier: ${carrier}, OTP: ${claimOtp}`);
  return parcel;
};

export const claimParcel = async (parcelId: string, claimOtp: string, guardUser: any) => {
  const parcel = await Parcel.findOne({ _id: parcelId, societyId: guardUser.societyId });
  if (!parcel) throw new Error('PARCEL_NOT_FOUND');
  if (parcel.status === 'Claimed') throw new Error('PARCEL_ALREADY_CLAIMED');
  if (parcel.claimOtp !== claimOtp.trim()) throw new Error('INVALID_CLAIM_OTP');

  parcel.status = 'Claimed';
  parcel.claimedAt = new Date();
  await parcel.save();

  logger.info(`[PARCEL CLAIMED] Parcel ${parcelId} claimed successfully for ${parcel.wing}-${parcel.flatNumber}`);
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

  // Generate 6-digit numeric pass code
  const passCode = Math.floor(100000 + Math.random() * 900000).toString();

  const pass = new GuestPass({
    societyId,
    residentId: residentUser._id,
    guestName,
    guestPhone,
    purpose: purpose || 'Guest',
    passCode,
    validDate: validDate ? new Date(validDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'Active'
  });

  await pass.save();
  logger.info(`[GUEST PASS CREATED] For ${guestName}, Code: ${passCode} by ${residentUser.name}`);
  return pass;
};

export const verifyGuestPass = async (passCode: string, guardUser: any) => {
  const pass = await GuestPass.findOne({
    societyId: guardUser.societyId,
    passCode: passCode.trim(),
    status: 'Active'
  }).populate('residentId', 'name wing flatNumber phone');

  if (!pass) throw new Error('INVALID_OR_EXPIRED_PASS');

  // Verify expiration date
  const now = new Date();
  if (now > new Date(pass.validDate)) {
    pass.status = 'Expired';
    await pass.save();
    throw new Error('PASS_EXPIRED');
  }

  pass.status = 'Used';
  pass.verifiedAt = now;
  pass.verifiedBy = guardUser._id;
  await pass.save();

  logger.info(`[GUEST PASS VERIFIED] Guest: ${pass.guestName}, Visiting: ${(pass.residentId as any)?.name}`);
  return pass;
};

export const getMyGuestPasses = async (user: any) => {
  if (user.role === 'member') {
    return await GuestPass.find({ societyId: user.societyId, residentId: user._id }).sort({ createdAt: -1 });
  }
  return await GuestPass.find({ societyId: user.societyId }).populate('residentId', 'name wing flatNumber').sort({ createdAt: -1 });
};
