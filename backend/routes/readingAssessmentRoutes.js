const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment
} = require('../controllers/readingAssessmentController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD routes
router.post('/', createAssessment);
router.get('/', getAllAssessments); // For history page
router.get('/:id', getAssessmentById);
router.put('/:id', updateAssessment);
router.delete('/:id', deleteAssessment);

module.exports = router; 