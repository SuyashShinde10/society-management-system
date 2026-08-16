const MaintenanceBill = require('../models/MaintenanceBill');
const User = require('../models/User');
const Society = require('../models/Society');
const sendEmail = require('../utils/sendEmail');
const { getProfessionalEmailTemplate } = require('../utils/emailTemplates');

// @desc  Generate bills based on target selection
// @route POST /api/bills/generate
// @access Admin
const generateBills = async (req, res) => {
  try {
    const { title, description, amount, dueDate, targetType, targetUserId } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ message: 'TITLE_AND_AMOUNT_REQUIRED' });
    }

    const society = await Society.findById(req.user.societyId);
    if (!society) return res.status(404).json({ message: 'SOCIETY_NOT_FOUND' });

    let members = [];
    if (targetType === 'Specific') {
      if (!targetUserId) return res.status(400).json({ message: 'TARGET_USER_REQUIRED' });
      const user = await User.findOne({ _id: targetUserId, societyId: req.user.societyId, role: 'member' });
      if (!user) return res.status(404).json({ message: 'MEMBER_NOT_FOUND' });
      members.push(user);
    } else {
      members = await User.find({ societyId: req.user.societyId, role: 'member', isActive: true });
    }

    const bills = [];
    const errors = [];

    for (const member of members) {
      try {
        const bill = await MaintenanceBill.create({
          societyId: req.user.societyId,
          userId: member._id,
          title,
          description,
          amount: Number(amount),
          dueDate: dueDate ? new Date(dueDate) : null,
        });
        
        // Notify member
        const html = getProfessionalEmailTemplate({
          subtitle: 'NEW MAINTENANCE BILL',
          greeting: `Hello ${member.name},`,
          bodyText: `A new maintenance bill of ₹${amount} has been generated for you.`,
          highlightBox: `₹${amount}`,
          highlightBoxLabel: `Due Date: ${dueDate ? new Date(dueDate).toDateString() : 'N/A'}`,
          warningText: 'Please login to the portal to view details and make payment.'
        });

        sendEmail({
          email: member.email,
          subject: `New Maintenance Bill: ${title}`,
          html
        });
        
        bills.push(bill);
      } catch (err) {
        errors.push(`Failed for ${member.name}: ${err.message}`);
      }
    }

    res.status(201).json({
      message: `Generated ${bills.length} bills. ${errors.length} skipped.`,
      bills,
      errors,
    });
  } catch (error) {
    console.error('Error generating bills:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Get all bills for the society (admin) or own bills (member)
// @route GET /api/bills
// @access Protected
const getBills = async (req, res) => {
  try {
    const filter = { societyId: req.user.societyId };

    // Members can only see their own bills
    if (req.user.role === 'member') {
      filter.userId = req.user._id;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const bills = await MaintenanceBill.find(filter)
      .populate('userId', 'name flatDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Mark a bill as paid or submit for verification
// @route PUT /api/bills/:id/pay
const markBillPaid = async (req, res) => {
  try {
    const { paymentMode, notes, action } = req.body;

    const bill = await MaintenanceBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'BILL_NOT_FOUND' });

    if (bill.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    // Members can only pay their own bills
    if (req.user.role !== 'admin' && bill.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'NOT_YOUR_BILL' });
    }

    const updateData = {};
    if (req.user.role === 'admin') {
      if (action === 'reject') {
        if (bill.status === 'Pending') return res.status(400).json({ message: 'BILL_ALREADY_PENDING' });
        updateData.status = 'Pending';
        updateData.paymentMode = null;
        updateData.isPaid = false;
      } else {
        if (bill.isPaid) return res.status(400).json({ message: 'BILL_ALREADY_PAID' });
        updateData.isPaid = true;
        updateData.status = 'Paid';
        updateData.paidOn = new Date();
        updateData.paymentMode = paymentMode || bill.paymentMode || 'Cash';
        updateData.markedPaidBy = req.user._id;
      }
    } else {
      // Member submission
      if (bill.isPaid) return res.status(400).json({ message: 'BILL_ALREADY_PAID' });
      if (bill.status === 'Under Verification') return res.status(400).json({ message: 'ALREADY_UNDER_VERIFICATION' });
      
      updateData.status = 'Under Verification';
      updateData.paymentMode = paymentMode || 'UPI';
    }

    if (notes) updateData.notes = notes;

    const updatedBill = await MaintenanceBill.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('userId', 'name email');
    
    if (updatedBill.status === 'Paid' && updatedBill.userId && updatedBill.userId.email) {
      const html = getProfessionalEmailTemplate({
        subtitle: 'PAYMENT RECEIPT',
        greeting: `Hello ${updatedBill.userId.name},`,
        bodyText: `Your payment of ₹${updatedBill.amount} for "${updatedBill.title}" has been received successfully via ${updatedBill.paymentMode}.`,
        footerText: 'Thank you!'
      });

      sendEmail({
        email: updatedBill.userId.email,
        subject: `Payment Receipt: ${updatedBill.title}`,
        html
      });
    }

    res.json(updatedBill);
  } catch (error) {
    console.error('Error marking bill paid:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Delete a bill
// @route DELETE /api/bills/:id
// @access Admin
const deleteBill = async (req, res) => {
  try {
    const bill = await MaintenanceBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'BILL_NOT_FOUND' });

    if (bill.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    await bill.deleteOne();
    
    res.json({ message: 'BILL_DELETED' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = { generateBills, getBills, markBillPaid, deleteBill };
