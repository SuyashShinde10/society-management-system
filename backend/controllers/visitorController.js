const Visitor = require('../models/Visitor');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const checkInVisitor = async (req, res) => {
  try {
    const { name, phone, purpose, wing, flatNumber, photo, signature } = req.body;
    if (!name || !phone || !purpose) {
      return res.status(400).json({ message: 'Name, phone and purpose are required' });
    }

    const visitor = await Visitor.create({
      name,
      phone,
      purpose,
      wing,
      flatNumber,
      photo,
      signature,
      societyId: req.user.societyId,
      enteredBy: req.user._id
    });

    // Bonus Feature: Send email to resident if wing and flatNumber are provided
    if (wing && flatNumber) {
      const resident = await User.findOne({ 
        societyId: req.user.societyId, 
        'flatDetails.wing': wing, 
        'flatDetails.flatNumber': flatNumber 
      });

      if (resident && resident.email) {
        const photoHtml = photo ? `<div style="margin:20px 0;"><img src="${photo}" alt="Visitor Photo" style="max-width:300px; border-radius:8px; border:2px solid #E2E8F0;" /></div>` : '';
        const signatureHtml = signature ? `<div style="margin:20px 0;"><p style="font-weight:600; color:#64748B;">Visitor Signature:</p><img src="${signature}" alt="Visitor Signature" style="max-width:200px; border-radius:8px; background:white; border:1px solid #E2E8F0;" /></div>` : '';

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

        await sendEmail({
          email: resident.email,
          subject: `Security Alert: Visitor Check-In - ${name}`,
          html: emailHtml
        });
      }
    }

    res.status(201).json({ message: 'Visitor checked in successfully', visitor });
  } catch (error) {
    console.error('// CHECKIN_VISITOR_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const checkOutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    
    if (visitor.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    visitor.status = 'CheckedOut';
    visitor.checkOutTime = new Date();
    await visitor.save();

    res.json({ message: 'Visitor checked out successfully', visitor });
  } catch (error) {
    console.error('// CHECKOUT_VISITOR_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const getSocietyVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({ societyId: req.user.societyId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(visitors);
  } catch (error) {
    console.error('// GET_VISITORS_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const getMyVisitors = async (req, res) => {
  try {
    const { flatDetails } = req.user;
    if (!flatDetails || !flatDetails.wing || !flatDetails.flatNumber) {
      return res.json([]);
    }

    const visitors = await Visitor.find({ 
      societyId: req.user.societyId,
      wing: flatDetails.wing,
      flatNumber: flatDetails.flatNumber
    }).sort({ createdAt: -1 }).limit(50);

    res.json(visitors);
  } catch (error) {
    console.error('// GET_MY_VISITORS_ERROR:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = {
  checkInVisitor,
  checkOutVisitor,
  getSocietyVisitors,
  getMyVisitors
};
