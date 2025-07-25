const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/:uid', chatController.getSessions);
router.post('/:uid/:sessionId', chatController.saveSession);

module.exports = router; 