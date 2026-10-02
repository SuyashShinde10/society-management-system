import Notice from '../models/Notice';
import User from '../models/User';
import sendEmail from '../utils/sendEmail';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';
import logger from '../utils/logger';
import { getPaginationParams, PaginationOptions } from '../utils/paginate';

export const getNotices = async (user: any, options?: PaginationOptions) => {
  if (!user.societyId) return [];

  const filter: any = { societyId: user.societyId };
  if (user.role === 'member') {
    filter.$or = [
      { targetType: 'All' },
      { targetType: 'Specific', targetUserId: user._id }
    ];
  }

  const { limit, skip } = getPaginationParams(options);
  return await Notice.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const addNotice = async (data: any, user: any) => {
  const { title, content, targetType, targetUserId } = data;

  if (!title || !content) {
    throw new Error('TITLE_AND_CONTENT_REQUIRED');
  }

  if (!user.societyId) {
    throw new Error('ACCOUNT_NOT_LINKED_TO_SOCIETY');
  }

  const notice = await Notice.create({
    title,
    content,
    societyId: user.societyId,
    createdBy: user._id,
    targetType: targetType || 'All',
    targetUserId: targetType === 'Specific' ? targetUserId : undefined,
  });

  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Notify members
  if (targetType === 'Specific') {
    const targetUser = await User.findOne({ _id: targetUserId, societyId: user.societyId });
    if (!targetUser) throw new Error('MEMBER_NOT_FOUND_IN_SOCIETY');

    const html = getProfessionalEmailTemplate({
      title: 'Society Notice Board',
      subtitle: 'DIRECT RESIDENT NOTICE',
      greeting: `Hello ${targetUser.name},`,
      bodyText: `A new notice has been published by the administration specifically for your unit: "<strong>${title}</strong>".<br><br>${content ? `${content}<br><br>` : ''}`,
      highlightBox: title,
      highlightBoxLabel: 'Notice Subject',
      actionButton: {
        text: 'View Notice on Board',
        url: `${appUrl}/resident`
      },
      footerText: 'Society Management Committee Communications'
    });

    sendEmail({
      email: targetUser.email,
      subject: `Notice: ${title}`,
      message: `Hello ${targetUser.name},\n\nA new notice has been posted specifically for you:\n\nTitle: ${title}\n\n${content}\n\nPlease check the portal for more details.`,
      html
    });
  } else {
    const members = await User.find({ societyId: user.societyId, role: 'member', isActive: true });
    
    const html = getProfessionalEmailTemplate({
      title: 'Society Notice Board',
      subtitle: 'COMMUNITY BROADCAST NOTICE',
      greeting: 'Hello Resident,',
      bodyText: `An official society circular has been posted by the administration: "<strong>${title}</strong>".<br><br>${content ? `${content}<br><br>` : ''}Please check your resident portal for complete circular documents and attachments.`,
      highlightBox: title,
      highlightBoxLabel: 'Circular Heading',
      actionButton: {
        text: 'Open Notice Board',
        url: `${appUrl}/resident`
      },
      footerText: 'Society Management Committee Communications'
    });
    // Fire and forget, or use emailQueue
    (async () => {
      for (const member of members) {
        await sendEmail({
          email: member.email,
          subject: `Society Notice: ${title}`,
          message: `Hello ${member.name},\n\nA new society notice has been posted:\n\nTitle: ${title}\n\n${content}\n\nPlease check the portal for more details.`,
          html
        }).catch((err: any) => logger.error("Notice email error:", err.message));
        await new Promise(r => setTimeout(r, 100)); // 100ms delay
      }
    })();
  }

  return notice;
};

export const deleteNotice = async (noticeId: string, user: any) => {
  const notice = await Notice.findById(noticeId);
  if (!notice) throw new Error('NOTICE_NOT_FOUND');

  if (notice.societyId.toString() !== user.societyId.toString() || user.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  await notice.deleteOne();
  return noticeId;
};
