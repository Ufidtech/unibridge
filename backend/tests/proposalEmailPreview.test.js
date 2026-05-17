import { beforeAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { firebaseAdmin, firestore } from '../src/lib/firebase.js';

let menteeToken, mentorToken, menteeUid, mentorUid, sessionId, proposalId;

beforeAll(async () => {
  const mentee = await firebaseAdmin.auth().createUser({ email: 'pm-mentee@example.com', displayName: 'PM Mentee' });
  menteeUid = mentee.uid;
  await firestore.collection('users').doc(menteeUid).set({ uid: menteeUid, name: 'PM Mentee', email: 'pm-mentee@example.com', role: 'MENTEE' });
  menteeToken = await firebaseAdmin.createCustomToken(menteeUid);

  const mentor = await firebaseAdmin.auth().createUser({ email: 'pm-mentor@example.com', displayName: 'PM Mentor' });
  mentorUid = mentor.uid;
  await firestore.collection('users').doc(mentorUid).set({ uid: mentorUid, name: 'PM Mentor', email: 'pm-mentor@example.com', role: 'MENTOR' });
  await firebaseAdmin.auth().setCustomUserClaims(mentorUid, { role: 'MENTOR' }).catch(() => {});
  mentorToken = await firebaseAdmin.createCustomToken(mentorUid);
});

describe('propose accept email preview flow', () => {
  it('creates session, proposes new time, mentor accepts, and email previews recorded', async () => {
    // create session
    const createRes = await request(app).post('/api/sessions').set('Authorization', `Bearer ${menteeToken}`).send({ mentorId: mentorUid, topic: 'Preview test', sessionDate: '2026-06-10', sessionTime: '10:00', notes: 'test' });
    expect(createRes.status).toBe(201);
    sessionId = createRes.body.sessionRequest.id;

    // propose new time
    const proposeRes = await request(app).post(`/api/sessions/${sessionId}/propose`).set('Authorization', `Bearer ${menteeToken}`).send({ sessionDate: '2026-06-11', sessionTime: '11:00', notes: 'can we move?' });
    expect(proposeRes.status).toBe(201);
    proposalId = proposeRes.body.proposal.id;

    // mentor accepts
    const acceptRes = await request(app).patch(`/api/sessions/${sessionId}/proposals/${proposalId}/status`).set('Authorization', `Bearer ${mentorToken}`).send({ status: 'ACCEPTED' });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.sessionRequest.status).toBe('CONFIRMED');

    // fetch email previews
    const previewsRes = await request(app).get('/api/dev/email-previews');
    expect(previewsRes.status).toBe(200);
    expect(Array.isArray(previewsRes.body.previews)).toBe(true);
    // there should be at least one preview (proposal notification or acceptance notification)
    expect(previewsRes.body.previews.length).toBeGreaterThanOrEqual(1);
  });
});
