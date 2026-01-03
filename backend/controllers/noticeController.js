const Notice = require('../models/Notice');

const getNotices = async (req, res) => {
  try {
    if (!req.user.societyId) return res.json([]);
    const notices = await Notice.find({ societyId: req.user.societyId }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addNotice = async (req, res) => {
  try {
    // 1. Extract 'content' matching the Model
    const { title, content } = req.body; 

    if (!req.user.societyId) {
      return res.status(400).json({ message: "Error: Account not linked to Society." });
    }

    // 2. Create using 'content'
    const notice = await Notice.create({
      title,
      content, 
      societyId: req.user.societyId,
      createdBy: req.user._id
    });

    res.status(201).json(notice);
  } catch (error) {
    console.error("Add Notice Error:", error); // Helps debug
    res.status(500).json({ message: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    if (req.user.role !== 'admin') return res.status(401).json({ message: 'Not authorized' });

    await notice.deleteOne();
    res.json({ message: 'Notice removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotices, addNotice, deleteNotice };