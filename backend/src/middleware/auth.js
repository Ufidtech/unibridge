import { firebaseAuth, firestore } from '../lib/firebase.js';

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice(7);
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: 'User record not found.' });
    }

    const user = userDoc.data();
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || user.email,
      name: decodedToken.name || user.name,
      role: decodedToken.role || user.role,
    };

    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have access to this resource.' });
    }

    return next();
  };
}