import { Router } from 'express';
import { z } from 'zod';
import { firestore } from '../lib/firebase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function mapSessionDoc(doc) {
  const session = doc.data();

  return {
    id: doc.id,
    menteeId: session.menteeId,
    mentorId: session.mentorId,
    topic: session.topic,
    sessionDate: session.sessionDate,
    sessionTime: session.sessionTime,
    notes: session.notes ?? null,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    mentee: session.mentee ?? null,
    mentor: session.mentor ?? null,
  };
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const field = req.user.role === 'MENTOR' ? 'mentorId' : 'menteeId';
    const sessionSnapshot = await firestore.collection('sessionRequests').where(field, '==', req.user.uid).orderBy('createdAt', 'desc').get();

    const sessionRequests = sessionSnapshot.docs.map(mapSessionDoc);
    return res.json({ sessionRequests });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, requireRole('MENTEE'), async (req, res, next) => {
  try {
    const body = z.object({
      mentorId: z.number().int(),
      topic: z.string().min(2),
      sessionDate: z.string().min(4),
      sessionTime: z.string().min(1),
      notes: z.string().optional(),
    }).parse(req.body);

    const mentorDoc = await firestore.collection('users').doc(body.mentorId).get();

    if (!mentorDoc.exists || mentorDoc.data().role !== 'MENTOR') {
      return res.status(404).json({ error: 'Mentor not found.' });
    }

    const now = new Date().toISOString();
    const sessionRef = firestore.collection('sessionRequests').doc();

    const sessionRequest = {
      id: sessionRef.id,
      menteeId: req.user.uid,
      mentorId: body.mentorId,
      topic: body.topic,
      sessionDate: body.sessionDate,
      sessionTime: body.sessionTime,
      notes: body.notes ?? null,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      mentee: {
        id: req.user.uid,
        name: req.user.name,
        email: req.user.email,
      },
      mentor: {
        id: mentorDoc.id,
        name: mentorDoc.data().name,
        email: mentorDoc.data().email,
      },
    };

    await sessionRef.set(sessionRequest);

    return res.status(201).json({ sessionRequest });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:sessionId/status', requireAuth, requireRole('MENTOR'), async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;
    const body = z.object({
      status: z.enum(['CONFIRMED', 'DECLINED', 'COMPLETED', 'CANCELLED']),
    }).parse(req.body);

    const sessionRef = firestore.collection('sessionRequests').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Session request not found.' });
    }

    const session = sessionDoc.data();

    if (session.mentorId !== req.user.uid) {
      return res.status(403).json({ error: 'You can only update your own session requests.' });
    }

    const updatedSessionRequest = {
      ...session,
      status: body.status,
      updatedAt: new Date().toISOString(),
    };

    await sessionRef.set(updatedSessionRequest, { merge: true });

    return res.json({ sessionRequest: { id: sessionId, ...updatedSessionRequest } });
  } catch (error) {
    return next(error);
  }
});

export default router;