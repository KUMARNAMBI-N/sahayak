const { lessonPlansDb } = require('../lib/firestore');

// Create a new lesson plan
const createLessonPlan = async (req, res) => {
  try {
    const { title, plan } = req.body;
    const userId = req.user.uid; // Firebase auth sets req.user.uid

    const savedPlan = await lessonPlansDb.create({
      title,
      plan,
      userId
    });
    res.status(201).json(savedPlan);
  } catch (error) {
    console.error('Error creating lesson plan:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all lesson plans for a user (for history)
const getAllLessonPlans = async (req, res) => {
  try {
    const userId = req.user.uid; // Firebase auth sets req.user.uid
    const plans = await lessonPlansDb.find({ userId });
    res.status(200).json(plans);
  } catch (error) {
    console.error('Error getting lesson plans:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single lesson plan by ID
const getLessonPlanById = async (req, res) => {
  try {
    const plan = await lessonPlansDb.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Lesson plan not found' });
    }
    res.status(200).json(plan);
  } catch (error) {
    console.error('Error getting lesson plan by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a lesson plan
const updateLessonPlan = async (req, res) => {
  try {
    const { title, plan } = req.body;
    const updatedPlan = await lessonPlansDb.findByIdAndUpdate(
      req.params.id,
      { title, plan }
    );
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Lesson plan not found' });
    }
    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error('Error updating lesson plan:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a lesson plan
const deleteLessonPlan = async (req, res) => {
  try {
    const plan = await lessonPlansDb.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Lesson plan not found' });
    }
    res.status(200).json({ message: 'Lesson plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson plan:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLessonPlan,
  getAllLessonPlans,
  getLessonPlanById,
  updateLessonPlan,
  deleteLessonPlan
}; 