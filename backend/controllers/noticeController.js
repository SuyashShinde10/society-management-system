const Notice = require('../models/Notice');

// 1. Get Notices
const getNotices = async (req, res) => {
  try {
    // Check if user is authenticated properly
    if (!req.user || !req.user.society) {
      return res.status(400).json({ message: "User not linked to a society" });
    }

    const mySocietyId = req.user.society; 
    const notices = await Notice.find({ society: mySocietyId }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Add Notice
const addNotice = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    
    if (!req.user || !req.user.society) {
      return res.status(400).json({ message: "User not linked to a society" });
    }

    await Notice.create({
      title,
      description,
      type,
      society: req.user.society
    });

    res.status(201).json({ message: "Notice added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Delete Notice
const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SAFE EXPORT (Do not change this) ---
module.exports = {
  getNotices,
  addNotice,
  deleteNotice
};