const express = require('express');
const router = express.Router();
const { 
  previewGoogleSheet,
  connectSpecificSheet,
  getUserSheets,
  syncSheet,
  disconnectSheet,
  setActiveSheet,
  deactivateSheet,
  getActiveSheets,
} = require('../controllers/sheetController');
const { protect } = require('../middleware/authMiddleware');

// Preview sheets
router.post('/preview', protect, previewGoogleSheet);

// Connect specific sheet
router.post('/connect-specific', protect, connectSpecificSheet);

// Get all connected sheets
router.get('/', protect, getUserSheets);

// NEW: Sync sheet (body params)
router.post('/sync', protect, syncSheet);

// NEW: Disconnect sheet (body params)
router.post('/disconnect', protect, disconnectSheet);

// Set/deactivate active sheets
router.post('/set-active', protect, setActiveSheet);
router.post('/deactivate', protect, deactivateSheet);

// Get active sheets
router.get('/active', protect, getActiveSheets);

module.exports = router;
