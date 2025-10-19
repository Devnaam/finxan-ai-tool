const admin = require('firebase-admin');

let firebaseInitialized = false;

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase credentials are provided
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PRIVATE_KEY) {
      console.warn('⚠️  Firebase credentials not configured.');
      return false;
    }

    if (!admin.apps.length) {
      // Parse private key - handle both \n format and actual newlines
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // If the key has escaped newlines, replace them
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      // Remove any quotes that might be wrapping the key
      privateKey = privateKey.replace(/^["']|["']$/g, '');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    firebaseInitialized = false;
    return false;
  }
};

// Verify Firebase ID token
const verifyFirebaseToken = async (idToken) => {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token: ' + error.message);
  }
};

// Get Firebase initialized status
const isFirebaseInitialized = () => {
  return firebaseInitialized;
};

module.exports = { 
  initializeFirebase, 
  verifyFirebaseToken, 
  isFirebaseInitialized 
};
