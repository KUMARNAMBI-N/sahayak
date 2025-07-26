const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/:uid/activities', profileController.getRecentActivities);
router.get('/:uid/dashboard-stats', profileController.getDashboardStats);
router.get('/:uid', profileController.getProfile);
router.put('/:uid', profileController.updateProfile);

module.exports = router; 