const Visitor = require('../models/Visitor');

// @desc  Log a new visitor entry
// @route POST /api/visitors
// @access Protected (member logs their own visitor)
const logVisitor = async (req, res) => {
  try {
    const { visitorName, visitorPhone, vehicleNumber, purpose, notes } = req.body;

    if (!visitorName) {
      return res.status(400).json({ message: 'VISITOR_NAME_REQUIRED' });
    }

    const visitor = await Visitor.create({
      societyId: req.user.societyId,
      hostUserId: req.user._id,
      visitorName,
      visitorPhone,
      vehicleNumber,
      purpose: purpose || 'Guest',
      notes,
    });

    res.status(201).json(visitor);
  } catch (error) {
    console.error('Error logging visitor:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Get all visitors (admin: all; member: own)
// @route GET /api/visitors
// @access Protected
const getVisitors = async (req, res) => {
  try {
    const filter = { societyId: req.user.societyId };

    if (req.user.role === 'member') {
      filter.hostUserId = req.user._id;
    }

    const visitors = await Visitor.find(filter)
      .populate('hostUserId', 'name flatDetails')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(visitors);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Mark visitor as exited
// @route PUT /api/visitors/:id/exit
// @access Protected
const markExit = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'VISITOR_NOT_FOUND' });

    if (visitor.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    visitor.status = 'Exited';
    visitor.exitTime = new Date();
    await visitor.save();
    
    res.json(visitor);
  } catch (error) {
    console.error('Error marking exit:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

// @desc  Delete a visitor log
// @route DELETE /api/visitors/:id
// @access Admin
const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'VISITOR_NOT_FOUND' });

    if (visitor.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    await visitor.deleteOne();
    
    res.json({ message: 'VISITOR_LOG_DELETED' });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = { logVisitor, getVisitors, markExit, deleteVisitor };
