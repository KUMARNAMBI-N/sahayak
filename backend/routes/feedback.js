const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/save-feedback', feedbackController.saveFeedback);

module.exports = router;