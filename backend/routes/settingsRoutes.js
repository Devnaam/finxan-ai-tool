const express = require('express');
const router = express.Router();
const {
  updateProfile,
  updateNotifications,
  getNotifications,
  changePassword,
  uploadPhoto
} = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG images are allowed'));
    }
  }
});

// @route   PUT /api/settings/profile
router.put('/profile', protect, updateProfile);

// @route   PUT /api/settings/notifications
router.put('/notifications', protect, updateNotifications);

// @route   GET /api/settings/notifications
router.get('/notifications', protect, getNotifications);

// @route   PUT /api/settings/password
router.put('/password', protect, changePassword);

// @route   POST /api/settings/photo
router.post('/photo', protect, upload.single('photo'), uploadPhoto);

module.exports = router;
