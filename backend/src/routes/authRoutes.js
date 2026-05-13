import { Router } from 'express';
import { z } from 'zod';
import { firebaseAuth, firebaseAdmin, firestore } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';
// aut
const router = Router();

const registerBaseSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/register/mentor', async (req, res, next) => {
  try {
    const body = registerBaseSchema.extend({
      university: z.string().optional(),
      level: z.string().optional(),
      bio: z.string().optional(),
      skills: z.array(z.string()).optional(),
      rating: z.number().optional(),
      reviews: z.number().int().optional(),
      responseTime: z.string().optional(),
    }).parse(req.body);

    const existingUser = await firebaseAuth.getUserByEmail(body.email).catch(() => null);

    if (existingUser) {
      return res.status(409).json({ error: 'Email is already in use.' });
    }

    let userRecord;
    try {
      userRecord = await firebaseAuth.createUser({
        email: body.email,
        password: body.password,
        displayName: body.name,
      });
    } catch (error) {
      console.error('❌ Firebase createUser error:', {
        code: error.code,
        message: error.message,
        email: body.email,
      });
      throw error;
    }

    await firebaseAuth.setCustomUserClaims(userRecord.uid, { role: 'MENTOR' });

    const now = new Date().toISOString();
    const userPayload = {
      uid: userRecord.uid,
      name: body.name,
      email: body.email,
      role: 'MENTOR',
      createdAt: now,
      updatedAt: now,
    };

    await firestore.collection('users').doc(userRecord.uid).set(userPayload);
    await firestore.collection('mentorProfiles').doc(userRecord.uid).set({
      userId: userRecord.uid,
      university: body.university ?? null,
      level: body.level ?? null,
      bio: body.bio ?? null,
      skills: body.skills ?? [],
      rating: body.rating ?? 0,
      reviews: body.reviews ?? 0,
      responseTime: body.responseTime ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const customToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid, {
      role: 'MENTOR',
    });

    return res.status(201).json({
      user: userPayload,
      customToken,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/register/mentee', async (req, res, next) => {
  try {
    const body = registerBaseSchema.extend({
      school: z.string().optional(),
      classLevel: z.string().optional(),
      dreamCourse: z.string().optional(),
    }).parse(req.body);

    const existingUser = await firebaseAuth.getUserByEmail(body.email).catch(() => null);

    if (existingUser) {
      return res.status(409).json({ error: 'Email is already in use.' });
    }

    let userRecord;
    try {
      userRecord = await firebaseAuth.createUser({
        email: body.email,
        password: body.password,
        displayName: body.name,
      });
    } catch (error) {
      console.error('❌ Firebase createUser error:', {
        code: error.code,
        message: error.message,
        email: body.email,
      });
      throw error;
    }

    await firebaseAuth.setCustomUserClaims(userRecord.uid, { role: 'MENTEE' });

    const now = new Date().toISOString();
    const userPayload = {
      uid: userRecord.uid,
      name: body.name,
      email: body.email,
      role: 'MENTEE',
      createdAt: now,
      updatedAt: now,
    };

    await firestore.collection('users').doc(userRecord.uid).set(userPayload);
    await firestore.collection('menteeProfiles').doc(userRecord.uid).set({
      userId: userRecord.uid,
      school: body.school ?? null,
      classLevel: body.classLevel ?? null,
      dreamCourse: body.dreamCourse ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const customToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid, {
      role: 'MENTEE',
    });

    return res.status(201).json({
      user: userPayload,
      customToken,
    });
  } catch (error) {
    console.error('❌ /register/mentee error:', error.message, error.stack);
    return next(error);
  }
});

router.post('/verify-token', async (req, res, next) => {
  try {
    const body = z.object({
      idToken: z.string().min(10),
    }).parse(req.body);

    const decodedToken = await firebaseAuth.verifyIdToken(body.idToken);
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      user: userDoc.data(),
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userDoc = await firestore.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userDoc.data();

    const profileCollection = user.role === 'MENTOR' ? 'mentorProfiles' : 'menteeProfiles';
    const profileDoc = await firestore.collection(profileCollection).doc(req.user.uid).get();

    return res.json({
      user: {
        ...user,
        [user.role === 'MENTOR' ? 'mentorProfile' : 'menteeProfile']: profileDoc.exists ? profileDoc.data() : null,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;