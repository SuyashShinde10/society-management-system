import Meeting from '../models/Meeting';
import User from '../models/User';
import sendEmail from '../utils/sendEmail';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import logger from '../utils/logger';

export const getMeetings = async (user: any) => {
  const filter: any = { societyId: user.societyId };
  if (user.role === 'member') {
    filter.$or = [
      { targetType: 'All' },
      { targetType: 'Specific', targetUserId: user._id }
    ];
  }

  return await Meeting.find(filter)
    .sort({ date: -1 })
    .populate('createdBy', 'name');
};

export const createMeeting = async (data: any, user: any) => {
  const { title, description, date, location, targetType, targetUserId } = data;

  if (!title || !description || !date || !location) {
    throw new Error('MISSING_FIELDS');
  }

  const meeting = await Meeting.create({
    title,
    description,
    date,
    location,
    societyId: user.societyId,
    createdBy: user._id,
    targetType: targetType || 'All',
    targetUserId: targetType === 'Specific' ? targetUserId : undefined,
  });

  const meetingDate = new Date(date).toLocaleString();
  
  if (targetType === 'Specific') {
    const targetUser = await User.findOne({ _id: targetUserId, societyId: user.societyId });
    if (!targetUser) throw new Error('MEMBER_NOT_FOUND_IN_SOCIETY');

    const html = getProfessionalEmailTemplate({
      subtitle: 'MEETING INVITATION',
      greeting: `Hello ${targetUser.name},`,
      bodyText: `You have been invited to a society meeting: "<strong>${title}</strong>".`,
      highlightBox: meetingDate,
      highlightBoxLabel: `Location: ${location}`,
      footerText: 'Please try to attend.'
    });

    sendEmail({
      email: targetUser.email,
      subject: `Meeting Invite: ${title}`,
      message: `Hello ${targetUser.name},\n\nYou have been invited to a society meeting.\n\nTitle: ${title}\nDate: ${meetingDate}\nLocation: ${location}\nDescription: ${description}\n\nPlease try to attend.`,
      html
    });
  } else {
    const members = await User.find({ societyId: user.societyId, role: 'member', isActive: true });
    
    const html = getProfessionalEmailTemplate({
      subtitle: 'SOCIETY MEETING',
      greeting: 'Hello Resident,',
      bodyText: `A new society meeting has been scheduled: "<strong>${title}</strong>".`,
      highlightBox: meetingDate,
      highlightBoxLabel: `Location: ${location}`,
      footerText: 'Your attendance is highly appreciated.'
    });

    (async () => {
      for (const member of members) {
        await sendEmail({
          email: member.email,
          subject: `Society Meeting: ${title}`,
          message: `Hello ${member.name},\n\nA new society meeting has been scheduled.\n\nTitle: ${title}\nDate: ${meetingDate}\nLocation: ${location}\nDescription: ${description}\n\nPlease try to attend.`,
          html
        }).catch((err: any) => logger.error("Meeting email error:", err.message));
        await new Promise(r => setTimeout(r, 100)); // 100ms delay
      }
    })();
  }

  return meeting;
};

export const deleteMeeting = async (meetingId: string, user: any) => {
  const meeting = await Meeting.findById(meetingId);
  
  if (!meeting) {
    throw new Error('MEETING_NOT_FOUND');
  }

  if (meeting.societyId.toString() !== user.societyId.toString()) {
    throw new Error('NOT_AUTHORIZED');
  }

  await meeting.deleteOne();
  return meetingId;
};
