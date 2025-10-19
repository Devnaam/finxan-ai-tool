const { verifyFirebaseToken } = require('../config/firebase');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token provided' 
      });
    }

    // Try to verify token with Firebase
    try {
      const decodedToken = await verifyFirebaseToken(token);
      
      // Attach user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0]
      };

      next();
    } catch (verifyError) {
      console.error('Token verification error:', verifyError.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, invalid token' 
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

module.exports = { protect };
