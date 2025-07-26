const { visualAidsDb } = require('../lib/firestore');

// Create a new visual aid
const createVisualAid = async (req, res) => {
  try {
    const { title, aidData } = req.body;
    const userId = req.user.uid; // Firebase auth sets req.user.uid

    const savedAid = await visualAidsDb.create({
      title,
      aidData,
      userId
    });
    res.status(201).json(savedAid);
  } catch (error) {
    console.error('Error creating visual aid:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all visual aids for a user (for history)
const getAllVisualAids = async (req, res) => {
  try {
    const userId = req.user.uid; // Firebase auth sets req.user.uid
    const aids = await visualAidsDb.find({ userId });
    res.status(200).json(aids);
  } catch (error) {
    console.error('Error getting visual aids:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single visual aid by ID
const getVisualAidById = async (req, res) => {
  try {
    const aid = await visualAidsDb.findById(req.params.id);
    if (!aid) {
      return res.status(404).json({ message: 'Visual aid not found' });
    }
    res.status(200).json(aid);
  } catch (error) {
    console.error('Error getting visual aid by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a visual aid
const updateVisualAid = async (req, res) => {
  try {
    const { title, aidData } = req.body;
    const aid = await visualAidsDb.findByIdAndUpdate(
      req.params.id,
      { title, aidData }
    );
    if (!aid) {
      return res.status(404).json({ message: 'Visual aid not found' });
    }
    res.status(200).json(aid);
  } catch (error) {
    console.error('Error updating visual aid:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a visual aid
const deleteVisualAid = async (req, res) => {
  try {
    const aid = await visualAidsDb.findByIdAndDelete(req.params.id);
    if (!aid) {
      return res.status(404).json({ message: 'Visual aid not found' });
    }
    res.status(200).json({ message: 'Visual aid deleted successfully' });
  } catch (error) {
    console.error('Error deleting visual aid:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVisualAid,
  getAllVisualAids,
  getVisualAidById,
  updateVisualAid,
  deleteVisualAid
}; 