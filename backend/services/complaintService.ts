import Complaint from '../models/Complaint';
import User from '../models/User';
import { sendComplaintNotificationToAdmins, sendComplaintStatusUpdateToUser } from '../services/emailService';
import { uploadBase64ToCloudinary } from '../utils/uploadCloudinary';

export const getComplaints = async (user: any, limit: number, cursor?: string) => {
  if (!user || !user.societyId) {
    return { complaints: [], total: 0, nextCursor: null };
  }

  const filter: any = { societyId: user.societyId };
  if (user.role !== 'admin') {
    filter.user = user._id;
  }

  if (cursor) {
    filter._id = { $lt: cursor };
  }

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('user', 'name flatDetails')
      .sort({ _id: -1 })
      .limit(limit),
    Complaint.countDocuments(filter)
  ]);

  const nextCursor = complaints.length === limit ? complaints[complaints.length - 1]._id : null;

  return { complaints, total, nextCursor };
};

export const addComplaint = async (data: any, user: any) => {
  const { title, description, attachment } = data;

  if (!title || !description) {
    throw new Error('TITLE_AND_DESCRIPTION_REQUIRED');
  }

  let attachmentUrl = attachment;
  if (attachmentUrl && attachmentUrl.startsWith('data:image')) {
    attachmentUrl = await uploadBase64ToCloudinary(attachmentUrl, 'complaints/attachments');
  }

  if (attachmentUrl && !attachmentUrl.startsWith('data:image')) {
    try {
      const url = new URL(attachmentUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('INVALID_ATTACHMENT_PROTOCOL');
      }
    } catch (e) {
      throw new Error('INVALID_ATTACHMENT_URL');
    }
  }

  const complaint = await Complaint.create({
    user: user._id,
    societyId: user.societyId,
    title,
    description,
    attachment: attachmentUrl,
    status: 'Pending',
  });

  const admins = await User.find({ societyId: user.societyId, role: 'admin' });
  sendComplaintNotificationToAdmins(admins, complaint);

  return complaint;
};

export const updateComplaintStatus = async (complaintId: string, status: string, user: any) => {
  const ALLOWED = ['Pending', 'Resolved', 'Declined'];
  if (!status || !ALLOWED.includes(status)) {
    throw new Error('INVALID_STATUS_VALUE');
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new Error('COMPLAINT_NOT_FOUND');

  if (complaint.societyId.toString() !== user.societyId.toString()) {
    throw new Error('FORBIDDEN');
  }

  complaint.status = status as any;
  const updatedComplaint = await complaint.save();
  
  const resident = await User.findById(complaint.user);
  if (resident) {
    sendComplaintStatusUpdateToUser(resident, complaint, status);
  }

  return updatedComplaint;
};

export const deleteComplaint = async (complaintId: string, user: any) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new Error('COMPLAINT_NOT_FOUND');

  if (user.role !== 'admin' && complaint.user.toString() !== user._id.toString()) {
    throw new Error('FORBIDDEN');
  }

  if (complaint.societyId.toString() !== user.societyId.toString()) {
    throw new Error('FORBIDDEN');
  }

  await complaint.deleteOne();
  return complaintId;
};
