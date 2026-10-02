import Visitor from '../models/Visitor';
import User from '../models/User';
import { emailQueue } from '../workers/emailQueue';
import { uploadBase64ToCloudinary } from '../utils/uploadCloudinary';
import { getProfessionalEmailTemplate } from '../utils/emailTemplates';

export const checkInVisitor = async (data: any, user: any) => {
  const { name, phone, purpose, wing, flatNumber, photo, signature } = data;
  
  if (!name || !phone || !purpose) {
    throw new Error('MISSING_FIELDS');
  }

  let photoUrl = null;
  let signatureUrl = null;

  if (photo && photo.startsWith('data:image')) {
    photoUrl = await uploadBase64ToCloudinary(photo, 'visitors/photos');
  }

  if (signature && signature.startsWith('data:image')) {
    signatureUrl = await uploadBase64ToCloudinary(signature, 'visitors/signatures');
  }

  const visitor = await Visitor.create({
    name,
    phone,
    purpose,
    wing,
    flatNumber,
    photo: photoUrl,
    signature: signatureUrl,
    societyId: user.societyId,
    enteredBy: user._id
  });

  if (wing && flatNumber) {
    const resident = await User.findOne({ 
      societyId: user.societyId, 
      $or: [
        { 'flatDetails.wing': wing, 'flatDetails.flatNumber': flatNumber },
        { wing, flatNumber }
      ]
    });

    if (resident && resident.email) {
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const photoHtml = photoUrl ? `<div style="margin: 14px 0;"><img src="${photoUrl}" alt="Visitor Photo" style="max-width: 240px; border-radius: 10px; border: 1px solid #cbd5e1;" /></div>` : '';
      const signatureHtml = signatureUrl ? `<div style="margin: 10px 0;"><p style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Visitor Signature</p><img src="${signatureUrl}" alt="Visitor Signature" style="max-width: 180px; border-radius: 8px; background: white; border: 1px solid #cbd5e1; padding: 4px;" /></div>` : '';

      const emailHtml = getProfessionalEmailTemplate({
        title: 'Gate Security Alert',
        subtitle: 'VISITOR CHECK-IN AT MAIN GATE',
        greeting: `Hello ${resident.name},`,
        bodyText: `A new visitor has just checked in at the security desk and is heading towards your unit (<strong>Wing ${wing} • Unit ${flatNumber}</strong>).`,
        highlightBox: `<strong>${name}</strong><br><span style="font-size: 13px; color: #64748b;">Phone: ${phone}</span><br><span style="font-size: 13px; color: #475569;">Purpose: ${purpose}</span><br><span style="font-size: 12px; color: #94a3b8;">Time: ${new Date().toLocaleTimeString()}</span>${photoHtml}${signatureHtml}`,
        highlightBoxLabel: 'Visitor Verification Profile',
        actionButton: {
          text: 'View Gate Log in Portal',
          url: `${appUrl}/resident`
        },
        warningText: 'If you are not expecting this person, please notify the security gate or intercom immediately.',
        footerText: 'Society Gate Automated Entry Monitoring'
      });

      await emailQueue.add('sendEmailJob', {
        email: resident.email,
        subject: `Security Alert: Visitor Check-In - ${name}`,
        html: emailHtml
      });
    }
  }

  return visitor;
};

export const checkOutVisitor = async (visitorId: string, user: any) => {
  const visitor = await Visitor.findById(visitorId);
  if (!visitor) throw new Error('VISITOR_NOT_FOUND');
  
  if (visitor.societyId.toString() !== user.societyId.toString()) {
    throw new Error('FORBIDDEN');
  }

  visitor.status = 'CheckedOut';
  visitor.checkOutTime = new Date();
  await visitor.save();

  return visitor;
};

import { getPaginationParams, PaginationOptions } from '../utils/paginate';

export const getSocietyVisitors = async (user: any, options?: PaginationOptions) => {
  const { limit, skip } = getPaginationParams(options);
  return await Visitor.find({ societyId: user.societyId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const getMyVisitors = async (user: any, options?: PaginationOptions) => {
  const { flatDetails } = user;
  if (!flatDetails || !flatDetails.wing || !flatDetails.flatNumber) {
    return [];
  }

  const { limit, skip } = getPaginationParams(options);
  return await Visitor.find({ 
    societyId: user.societyId,
    wing: flatDetails.wing,
    flatNumber: flatDetails.flatNumber
  }).sort({ createdAt: -1 }).skip(skip).limit(limit);
};
