const User = require('../models/User');
const { verifyFirebaseToken } = require('../config/firebase');

// @desc    Register new user
exports.register = async (req, res) => {
  try {
    const { firebaseUid, email, name, profilePicture } = req.body;

    // Check if user already exists
    let user = await User.findOne({ firebaseUid });

    if (user) {
      // Return success with existing user (idempotent)
      return res.status(200).json({ 
        success: true, 
        message: 'User already exists', 
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          profilePicture: user.profilePicture
        }
      });
    }

    // Create new user
    user = await User.create({
      firebaseUid,
      email,
      name,
      profilePicture: profilePicture || null,
      lastLogin: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(idToken);

    // Find or create user
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        profilePicture: decodedToken.picture || null,
        lastLogin: new Date()
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        plan: user.plan,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

// @desc    Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid })
      .populate('uploadedFiles')
      .select('-__v');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
