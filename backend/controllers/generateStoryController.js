const { storiesDb } = require('../lib/firestore');

// Create a new story
const createStory = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.uid; // Firebase auth sets req.user.uid

    const savedStory = await storiesDb.create({
      title,
      content,
      userId
    });
    res.status(201).json(savedStory);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all stories for a user (for history)
const getAllStories = async (req, res) => {
  try {
    const userId = req.user.uid; // Firebase auth sets req.user.uid
    const stories = await storiesDb.find({ userId });
    res.status(200).json(stories);
  } catch (error) {
    console.error('Error getting stories:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single story by ID
const getStoryById = async (req, res) => {
  try {
    const story = await storiesDb.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.status(200).json(story);
  } catch (error) {
    console.error('Error getting story by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a story
const updateStory = async (req, res) => {
  try {
    const { title, content } = req.body;
    const story = await storiesDb.findByIdAndUpdate(
      req.params.id,
      { title, content }
    );
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.status(200).json(story);
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a story
const deleteStory = async (req, res) => {
  try {
    const story = await storiesDb.findByIdAndDelete(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory
}; 