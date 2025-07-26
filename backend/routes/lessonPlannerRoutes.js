const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createLessonPlan,
  getAllLessonPlans,
  getLessonPlanById,
  updateLessonPlan,
  deleteLessonPlan
} = require('../controllers/lessonPlannerController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD routes
router.post('/', createLessonPlan);
router.get('/', getAllLessonPlans); // For history page
router.get('/:id', getLessonPlanById);
router.put('/:id', updateLessonPlan);
router.delete('/:id', deleteLessonPlan);

module.exports = router; 