import { Router } from 'express';
import process from 'node:process';
import { firebaseAuth, firestore } from '../lib/firebase.js';

const router = Router();

router.post('/calendar-preview', async (req, res) => {
  const { summary, description, startDate, endDate, attendees = [] } = req.body || {};

  const payload = {
    summary,
    description,
    start: { dateTime: startDate },
    end: { dateTime: endDate },
    attendees: attendees.map((email) => ({ email })),
    conferenceData: { createRequest: { requestId: `preview-${Date.now()}` } },
  };

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return res.json({ ok: true, mode: 'preview', payload });
  }

  try {
    const { google } = await import('googleapis');
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const jwtClient = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const resp = await calendar.events.insert({ calendarId, resource: payload, conferenceDataVersion: 1 });
    return res.json({ ok: true, mode: 'created', event: resp.data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

export default router;

// Debug-only: inspect Authorization token and Firestore users doc
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(400).json({ error: 'No bearer token provided in Authorization header' });
    const token = auth.slice(7);
    const decoded = await firebaseAuth.verifyIdToken(token);
    const userDoc = await firestore.collection('users').doc(decoded.uid).get();
    return res.json({ ok: true, decoded, userExists: userDoc.exists, userDoc: userDoc.exists ? userDoc.data() : null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});
