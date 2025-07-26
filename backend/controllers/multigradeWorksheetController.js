const { worksheetsDb } = require('../lib/firestore');

// Create a new worksheet
const createWorksheet = async (req, res) => {
  try {
    const { title, worksheetData } = req.body;
    const userId = req.user.uid; // Firebase auth sets req.user.uid

    const savedWorksheet = await worksheetsDb.create({
      title,
      worksheetData,
      userId
    });
    res.status(201).json(savedWorksheet);
  } catch (error) {
    console.error('Error creating worksheet:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all worksheets for a user (for history)
const getAllWorksheets = async (req, res) => {
  try {
    const userId = req.user.uid; // Firebase auth sets req.user.uid
    const worksheets = await worksheetsDb.find({ userId });
    res.status(200).json(worksheets);
  } catch (error) {
    console.error('Error getting worksheets:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single worksheet by ID
const getWorksheetById = async (req, res) => {
  try {
    const worksheet = await worksheetsDb.findById(req.params.id);
    if (!worksheet) {
      return res.status(404).json({ message: 'Worksheet not found' });
    }
    res.status(200).json(worksheet);
  } catch (error) {
    console.error('Error getting worksheet by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a worksheet
const updateWorksheet = async (req, res) => {
  try {
    const { title, worksheetData } = req.body;
    const worksheet = await worksheetsDb.findByIdAndUpdate(
      req.params.id,
      { title, worksheetData }
    );
    if (!worksheet) {
      return res.status(404).json({ message: 'Worksheet not found' });
    }
    res.status(200).json(worksheet);
  } catch (error) {
    console.error('Error updating worksheet:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a worksheet
const deleteWorksheet = async (req, res) => {
  try {
    const worksheet = await worksheetsDb.findByIdAndDelete(req.params.id);
    if (!worksheet) {
      return res.status(404).json({ message: 'Worksheet not found' });
    }
    res.status(200).json({ message: 'Worksheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting worksheet:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWorksheet,
  getAllWorksheets,
  getWorksheetById,
  updateWorksheet,
  deleteWorksheet
}; 