const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createWorksheet,
  getAllWorksheets,
  getWorksheetById,
  updateWorksheet,
  deleteWorksheet
} = require('../controllers/multigradeWorksheetController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD routes
router.post('/', createWorksheet);
router.get('/', getAllWorksheets); // For history page
router.get('/:id', getWorksheetById);
router.put('/:id', updateWorksheet);
router.delete('/:id', deleteWorksheet);

module.exports = router; 