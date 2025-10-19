const express = require('express');
const router = express.Router();
const { 
  uploadFile, 
  getUserFiles, 
  deleteFile,
  getFileById 
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   POST /api/files/upload
// @desc    Upload Excel, PDF, or CSV file
// @access  Private
router.post('/upload', protect, upload.single('file'), uploadFile);

// @route   GET /api/files
// @desc    Get all user files
// @access  Private
router.get('/', protect, getUserFiles);

// @route   GET /api/files/:id
// @desc    Get single file by ID
// @access  Private
router.get('/:id', protect, getFileById);

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Private
router.delete('/:id', protect, deleteFile);

module.exports = router;
