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


// Test endpoint to check inventory context
router.get('/test-inventory', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const Inventory = require('../models/Inventory');
    
    const user = await User.findOne({ firebaseUid: req.user.uid }).select('activeSheets');
    
    let inventoryDocs;
    
    if (user?.activeSheets && user.activeSheets.length > 0) {
      const activeSourceIds = user.activeSheets.map(s => s.sourceId);
      inventoryDocs = await Inventory.find({ 
        userId: req.user.uid,
        sourceId: { $in: activeSourceIds }
      });
    } else {
      inventoryDocs = await Inventory.find({ 
        userId: req.user.uid,
        sourceType: { $ne: 'google-sheet' }
      });
    }
    
    res.json({
      success: true,
      activeSheets: user?.activeSheets || [],
      inventoryCount: inventoryDocs?.length || 0,
      totalItems: inventoryDocs?.reduce((sum, inv) => sum + (inv.data?.length || 0), 0) || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;
