const Notice = require('../models/Notice');

const getNotices = async (req, res) => {
  try {
    if (!req.user.societyId) return res.json([]);

    const notices = await Notice.find({ societyId: req.user.societyId })
      .sort({ createdAt: -1 })
      .limit(100); // Safety cap

    res.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const addNotice = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'TITLE_AND_CONTENT_REQUIRED' });
    }

    if (!req.user.societyId) {
      return res.status(400).json({ message: 'ACCOUNT_NOT_LINKED_TO_SOCIETY' });
    }

    const notice = await Notice.create({
      title,
      content,
      societyId: req.user.societyId,
      createdBy: req.user._id
    });

    res.status(201).json(notice);
  } catch (error) {
    console.error('Add Notice Error:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'NOTICE_NOT_FOUND' });

    // Ensure notice belongs to admin's society
    if (notice.societyId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    await notice.deleteOne();
    res.json({ message: 'NOTICE_REMOVED' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = { getNotices, addNotice, deleteNotice };