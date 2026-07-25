import { getAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase-admin/app';
import jwt from 'jsonwebtoken';

// Initialize Firebase Admin with just the projectId (sufficient for verifying ID tokens)
initializeApp({
  projectId: "sheger-systems",
});

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Try Custom JWT first
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_dev_secret_key';
    const decodedCustom = jwt.verify(token, jwtSecret);
    req.user = {
      uid: decodedCustom.uid,
      email: decodedCustom.email
    };
    return next();
  } catch (jwtError) {
    // If it's not a valid custom JWT, it might be a Firebase token
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      return next();
    } catch (firebaseError) {
      console.error('Auth Error: Token invalid for both Custom JWT and Firebase');
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  }
};


