const MaintenanceBill = require('../models/MaintenanceBill');
const User = require('../models/User');
const Society = require('../models/Society');

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

    const bills = await MaintenanceBill.find(filter)
      .populate('userId', 'name flatDetails')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Mark a bill as paid
// @route PUT /api/bills/:id/pay
// @access Admin
const markBillPaid = async (req, res) => {
  try {
    const { paymentMode, notes } = req.body;

    const bill = await MaintenanceBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'BILL_NOT_FOUND' });

    if (bill.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    bill.isPaid = true;
    bill.paidOn = new Date();
    bill.paymentMode = paymentMode || 'Cash';
    bill.markedPaidBy = req.user._id;
    if (notes) bill.notes = notes;

    await bill.save();
    
    res.json(bill);
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
