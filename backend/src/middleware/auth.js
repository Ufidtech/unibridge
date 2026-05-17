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
      console.warn('requireAuth: no Authorization header or Bearer token present');
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      console.warn(`requireAuth: user record not found for uid=${decodedToken.uid}`);
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
    // Log the error for debugging; if it's a verification issue the
    // firebaseAuth.verifyIdToken call will throw. Don't expose internal
    // details in production.
    console.error('requireAuth: token verification failed', arguments[0]);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    console.log("🔐 Role check:", {
      requiredRoles: roles,
      userRole: req.user?.role,
      uid: req.user?.uid,
      user: req.user,
    });

    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      console.warn("⛔ Access denied:", {
        required: roles,
        actual: req.user.role,
        uid: req.user.uid,
      });

      return res.status(403).json({
        error: "You do not have access to this resource.",
      });
    }

    next();
  };
}
