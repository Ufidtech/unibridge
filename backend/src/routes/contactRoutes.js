import { Router } from 'express';
import { firestore } from '../lib/firebase.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const snapshot = await firestore.collection('contactMessages').orderBy('createdAt', 'desc').get();
    const contactMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.json({ contactMessages });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
  const { name, email, message } = req.body ?? {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required.' });
  }

  const now = new Date().toISOString();
  const contactMessage = {
    name,
    email,
    message,
    createdAt: now,
  };

  const docRef = await firestore.collection('contactMessages').add(contactMessage);

  return res.status(201).json({ contactMessage: { id: docRef.id, ...contactMessage } });
  } catch (error) {
    return next(error);
  }
});

export default router;