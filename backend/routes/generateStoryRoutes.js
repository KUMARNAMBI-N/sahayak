const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory
} = require('../controllers/generateStoryController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD routes
router.post('/', createStory);
router.get('/', getAllStories); // For history page
router.get('/:id', getStoryById);
router.put('/:id', updateStory);
router.delete('/:id', deleteStory);

module.exports = router; 