const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getUnifiedHistory } = require('../lib/firestore');

// Create a new library item
router.post('/', libraryController.createLibraryItem);
// Get all library items for a user
router.get('/user/:userId', libraryController.getLibraryItemsByUser);
// Update a library item
router.patch('/:id', libraryController.updateLibraryItem);
// Delete a library item
router.delete('/:id', libraryController.deleteLibraryItem);

// Unified history endpoint - requires authentication
router.get('/history', authMiddleware, async (req, res) => {
  try {
    console.log('=== History endpoint called ===');
    console.log('User object:', req.user);
    console.log('User UID:', req.user.uid);
    
    const userId = req.user.uid; // Firebase auth sets req.user.uid
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(400).json({ error: 'User ID not found' });
    }
    
    // Get unified history from Firestore
    const allItems = await getUnifiedHistory(userId);
    
    console.log('Total items found:', allItems.length);
    console.log('=== History endpoint completed ===');
    res.json(allItems);
  } catch (error) {
    console.error('Error in history endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 