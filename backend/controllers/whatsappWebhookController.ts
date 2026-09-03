import { Request, Response } from 'express';
import User from '../models/User';
import MaintenanceBill from '../models/MaintenanceBill';
import GuestPass from '../models/GuestPass';
import Complaint from '../models/Complaint';
import Visitor from '../models/Visitor';
import logger from '../utils/logger';

export const handleWhatsAppMessage = async (req: Request, res: Response) => {
  try {
    // Supports standard Twilio / Meta WhatsApp webhook body or simulated payload
    const fromPhone = req.body.From || req.body.from || req.body.phone;
    const bodyText = (req.body.Body || req.body.message || '').trim();

    if (!fromPhone || !bodyText) {
      return res.status(400).json({ error: 'Phone number and message body are required' });
    }

    // Clean phone number (strip 'whatsapp:', '+', spaces)
    const cleanPhone = fromPhone.replace(/whatsapp:|\+|\s|-/g, '');

    // Identify resident by phone (or fallback demo user if simulation)
    let resident = await User.findOne({
      phone: { $regex: new RegExp(cleanPhone.slice(-10) + '$') }
    }).populate('societyId');

    if (!resident) {
      // Return WhatsApp Bot welcome for unregistered numbers
      const responseMsg = `👋 Welcome to Awaas Smart Society Bot!\nYour phone number (${fromPhone}) is not registered with any society flat.\nPlease contact your society administrator.`;
      return res.status(200).json({ reply: responseMsg });
    }

    const societyId = resident.societyId?._id || resident.societyId;
    const upperText = bodyText.toUpperCase();
    let reply = '';

    const flatLabel = resident.flatDetails ? `${resident.flatDetails.wing}-${resident.flatDetails.flatNumber}` : 'your flat';

    // --- COMMAND: STATUS / DUES ---
    if (upperText.startsWith('STATUS') || upperText.startsWith('DUE') || upperText.startsWith('BILL')) {
      const pendingBills = await MaintenanceBill.find({
        societyId,
        userId: resident._id,
        status: 'Pending'
      });

      const totalDue = pendingBills.reduce((sum, b) => sum + (b.amount || 0), 0);

      if (totalDue === 0) {
        reply = `✅ Hi ${resident.name}! You have NO outstanding maintenance dues. All bills are clear for Flat ${flatLabel}.`;
      } else {
        reply = `⚠️ Hi ${resident.name}, you have ${pendingBills.length} pending maintenance bill(s) totaling ₹${totalDue}.\nPay instantly via your resident portal.`;
      }
    }

    // --- COMMAND: VISITOR PASS (VISITOR <Name> <Phone>) ---
    else if (upperText.startsWith('VISITOR') || upperText.startsWith('PASS')) {
      const parts = bodyText.split(/\s+/);
      const guestName = parts[1] || 'Guest';
      const guestPhone = parts[2] || '9999999999';

      const passCode = Math.floor(100000 + Math.random() * 900000).toString();

      await GuestPass.create({
        societyId,
        residentId: resident._id,
        guestName,
        guestPhone,
        purpose: 'Pre-Approved via WhatsApp',
        passCode,
        validDate: new Date(Date.now() + 24 * 3600 * 1000),
        status: 'Active'
      });

      reply = `🎟️ *Pre-Approved Guest Pass Created!*\nGuest: ${guestName}\nPass Code: *${passCode}*\nValid: 24 Hours\nShare this code with your visitor to show at the security gate.`;
    }

    // --- COMMAND: APPROVE VISITOR (APPROVE <Name>) ---
    else if (upperText.startsWith('APPROVE')) {
      const visitor = await Visitor.findOne({
        societyId,
        wing: resident.flatDetails?.wing,
        flatNumber: resident.flatDetails?.flatNumber,
        status: 'Inside'
      }).sort({ createdAt: -1 });

      if (visitor) {
        reply = `✅ Visitor *${visitor.name}* is confirmed inside for Flat ${flatLabel}.`;
      } else {
        reply = `ℹ️ No active visitors currently at the gate for Flat ${flatLabel}.`;
      }
    }

    // --- COMMAND: COMPLAINT (COMPLAINT <Text>) ---
    else if (upperText.startsWith('COMPLAINT') || upperText.startsWith('ISSUE')) {
      const issue = bodyText.replace(/^COMPLAINT|^ISSUE/i, '').trim() || 'General Issue';

      const complaint = await Complaint.create({
        user: resident._id,
        societyId,
        title: issue.slice(0, 50),
        description: issue,
        category: 'Other',
        status: 'Pending',
        priority: 'Medium'
      });

      reply = `📝 *Complaint Registered!*\nTicket ID: #${complaint._id.toString().slice(-6)}\nIssue: "${issue}"\nThe society management has been alerted.`;
    }

    // --- COMMAND: HELP / FALLBACK ---
    else {
      reply = `🤖 *Awaas Smart Assistant Options:*\n\n1️⃣ *STATUS* - Check pending maintenance dues\n2️⃣ *VISITOR <Name> <Phone>* - Generate instant guest pass code\n3️⃣ *APPROVE* - Approve waiting visitor at the gate\n4️⃣ *COMPLAINT <Details>* - Log maintenance issue\n\nReply with any keyword above to proceed!`;
    }

    logger.info(`[WHATSAPP BOT] Replied to ${cleanPhone}: "${reply.slice(0, 40)}..."`);
    res.status(200).json({ reply });

  } catch (error: any) {
    logger.error('Error handling WhatsApp webhook:', error);
    res.status(500).json({ error: 'Server error processing WhatsApp bot command' });
  }
};
