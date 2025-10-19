const express = require('express');
const router = express.Router();
const { 
  sendMessage,
  getChatHistory,
  createNewSession,
  deleteSession
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/chat/message
// @desc    Send message to AI assistant
// @access  Private
router.post('/message', protect, sendMessage);

// @route   POST /api/chat/session
// @desc    Create new chat session
// @access  Private
router.post('/session', protect, createNewSession);

// @route   GET /api/chat/history/:sessionId
// @desc    Get chat history for session
// @access  Private
router.get('/history/:sessionId', protect, getChatHistory);

// @route   DELETE /api/chat/session/:sessionId
// @desc    Delete chat session
// @access  Private
router.delete('/session/:sessionId', protect, deleteSession);

module.exports = router;
