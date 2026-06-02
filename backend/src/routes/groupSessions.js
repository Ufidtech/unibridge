import { Router } from 'express';
import { z } from 'zod';
import { firestore } from '../lib/firebase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

async function getMentorName(mentorId) {
  try {
    const mentorDoc = await firestore.collection('users').doc(mentorId).get();
    return mentorDoc.exists ? mentorDoc.data()?.name || 'Mentor' : 'Mentor';
  } catch {
    return 'Mentor';
  }
}

// Create a group session (MENTOR only)
router.post('/', requireAuth, requireRole('MENTOR'), async (req, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(3),
      description: z.string().optional(),
      datetime: z.string().min(1),
      durationMinutes: z.coerce.number().int().optional(),
      capacity: z.coerce.number().int().optional(),
      isRecorded: z.coerce.boolean().optional(),
    });

    const body = schema.parse(req.body);

    const now = new Date().toISOString();

    const session = {
      mentorId: req.user.uid,
      mentorName: req.user.name || 'Mentor',
      title: body.title,
      description: body.description || null,
      datetime: body.datetime,
      durationMinutes: body.durationMinutes || 60,
      capacity: body.capacity || null,
      isRecorded: !!body.isRecorded,
      joinUrl: body.joinUrl || null,
      attendees: [],
      createdAt: now,
      updatedAt: now,
    };

    const ref = await firestore.collection('groupSessions').add(session);

    return res.status(201).json({ id: ref.id, ...session });
  } catch (err) {
    return next(err);
  }
});

// List public group sessions
router.get('/', async (req, res, next) => {
  try {
    const snapshot = await firestore.collection('groupSessions').orderBy('datetime').get();
    const sessions = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        mentorName: data.mentorName || (await getMentorName(data.mentorId)),
      };
    }));
    return res.json({ sessions });
  } catch (err) {
    return next(err);
  }
});

// Join a public group session (anyone)
router.post('/:id/join', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionRef = firestore.collection('groupSessions').doc(id);
    const doc = await sessionRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Session not found' });

    const data = doc.data();
    const attendees = Array.isArray(data.attendees) ? data.attendees.slice() : [];
    const userId = req.user?.uid || `guest-${Date.now()}`;

    if (data.capacity && attendees.length >= data.capacity && !attendees.includes(userId)) {
      return res.status(400).json({ error: 'Session is full' });
    }

    if (!attendees.includes(userId)) attendees.push(userId);

    await sessionRef.set({ attendees, updatedAt: new Date().toISOString() }, { merge: true });

    return res.json({ id, attendees, joined: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
