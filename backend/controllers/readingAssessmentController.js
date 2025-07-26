const { readingAssessmentsDb } = require('../lib/firestore');

// Create a new assessment
const createAssessment = async (req, res) => {
  try {
    const { title, assessmentData } = req.body;
    const userId = req.user.uid; // Firebase auth sets req.user.uid

    const savedAssessment = await readingAssessmentsDb.create({
      title,
      assessmentData,
      userId
    });
    res.status(201).json(savedAssessment);
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all assessments for a user (for history)
const getAllAssessments = async (req, res) => {
  try {
    const userId = req.user.uid; // Firebase auth sets req.user.uid
    const assessments = await readingAssessmentsDb.find({ userId });
    res.status(200).json(assessments);
  } catch (error) {
    console.error('Error getting assessments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single assessment by ID
const getAssessmentById = async (req, res) => {
  try {
    const assessment = await readingAssessmentsDb.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(200).json(assessment);
  } catch (error) {
    console.error('Error getting assessment by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update an assessment
const updateAssessment = async (req, res) => {
  try {
    const { title, assessmentData } = req.body;
    const assessment = await readingAssessmentsDb.findByIdAndUpdate(
      req.params.id,
      { title, assessmentData }
    );
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(200).json(assessment);
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete an assessment
const deleteAssessment = async (req, res) => {
  try {
    const assessment = await readingAssessmentsDb.findByIdAndDelete(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(200).json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment
}; 