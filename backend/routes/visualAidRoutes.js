const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createVisualAid,
  getAllVisualAids,
  getVisualAidById,
  updateVisualAid,
  deleteVisualAid
} = require('../controllers/visualAidController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD routes
router.post('/', createVisualAid);
router.get('/', getAllVisualAids); // For history page
router.get('/:id', getVisualAidById);
router.put('/:id', updateVisualAid);
router.delete('/:id', deleteVisualAid);

module.exports = router; 