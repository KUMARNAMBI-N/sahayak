const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');

// Create a new library item
router.post('/', libraryController.createLibraryItem);
// Get all library items for a user
router.get('/user/:userId', libraryController.getLibraryItemsByUser);
// Update a library item
router.patch('/:id', libraryController.updateLibraryItem);
// Delete a library item
router.delete('/:id', libraryController.deleteLibraryItem);

module.exports = router; 