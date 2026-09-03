import Visitor from '../models/Visitor';
import User from '../models/User';
import { emailQueue } from '../workers/emailQueue';
import { uploadBase64ToCloudinary } from '../utils/uploadCloudinary';

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
      'flatDetails.wing': wing, 
      'flatDetails.flatNumber': flatNumber 
    });

    if (resident && resident.email) {
      const photoHtml = photoUrl ? `<div style="margin:20px 0;"><img src="${photoUrl}" alt="Visitor Photo" style="max-width:300px; border-radius:8px; border:2px solid #E2E8F0;" /></div>` : '';
      const signatureHtml = signatureUrl ? `<div style="margin:20px 0;"><p style="font-weight:600; color:#64748B;">Visitor Signature:</p><img src="${signatureUrl}" alt="Visitor Signature" style="max-width:200px; border-radius:8px; background:white; border:1px solid #E2E8F0;" /></div>` : '';

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1E293B; margin-top: 0;">New Visitor at the Gate</h2>
          <p style="color: #475569; font-size: 16px;">Hello ${resident.name},</p>
          <p style="color: #475569; font-size: 16px;">A new visitor has just checked in at the security desk and is heading to your flat.</p>
          
          <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${phone}</p>
            <p style="margin: 0 0 10px 0;"><strong>Purpose:</strong> ${purpose}</p>
            <p style="margin: 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          ${photoHtml}
          ${signatureHtml}

          <p style="color: #94A3B8; font-size: 14px; margin-top: 30px;">
            If you are not expecting this person, please contact the security desk immediately.
          </p>
        </div>
      `;

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

export const getSocietyVisitors = async (user: any) => {
  return await Visitor.find({ societyId: user.societyId })
    .sort({ createdAt: -1 })
    .limit(100);
};

export const getMyVisitors = async (user: any) => {
  const { flatDetails } = user;
  if (!flatDetails || !flatDetails.wing || !flatDetails.flatNumber) {
    return [];
  }

  return await Visitor.find({ 
    societyId: user.societyId,
    wing: flatDetails.wing,
    flatNumber: flatDetails.flatNumber
  }).sort({ createdAt: -1 }).limit(50);
};
