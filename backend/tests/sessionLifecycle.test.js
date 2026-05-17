import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { firebaseAdmin, firestore } from '../src/lib/firebase.js';

let menteeToken, mentorToken, menteeUid, mentorUid;
let sessionId;
let proposalId;

beforeAll(async () => {
  // create mentee
  const mentee = await firebaseAdmin.auth().createUser({ email: 'mentee@example.com', displayName: 'Mentee User' });
  menteeUid = mentee.uid;
  // write role and profile in users collection
  await firestore.collection('users').doc(menteeUid).set({ uid: menteeUid, name: 'Mentee User', email: 'mentee@example.com', role: 'MENTEE' });
  menteeToken = await firebaseAdmin.createCustomToken(menteeUid);

  // create mentor
  const mentor = await firebaseAdmin.auth().createUser({ email: 'mentor@example.com', displayName: 'Mentor User' });
  mentorUid = mentor.uid;
  await firestore.collection('users').doc(mentorUid).set({ uid: mentorUid, name: 'Mentor User', email: 'mentor@example.com', role: 'MENTOR' });
  // set custom claims as mentor
  await firebaseAdmin.auth().setCustomUserClaims(mentorUid, { role: 'MENTOR' }).catch(() => {});
  mentorToken = await firebaseAdmin.createCustomToken(mentorUid);
});

describe('session lifecycle', () => {
  it('mentees can create a session request', async () => {
    const payload = {
      mentorId: mentorUid,
      topic: 'Test session flow',
      sessionDate: '2026-06-01',
      sessionTime: '14:00',
      notes: 'Initial request',
      mentorName: 'Mentor User',
      mentorEmail: 'mentor@example.com',
    };

    const res = await request(app).post('/api/sessions').set('Authorization', `Bearer ${menteeToken}`).send(payload);
    expect(res.status).toBe(201);
    expect(res.body.sessionRequest).toBeDefined();
    sessionId = res.body.sessionRequest.id;
    expect(res.body.sessionRequest.status).toBe('PENDING');
  });

  it('mentor can confirm the session', async () => {
    const res = await request(app).patch(`/api/sessions/${sessionId}/status`).set('Authorization', `Bearer ${mentorToken}`).send({ status: 'CONFIRMED' });
    expect(res.status).toBe(200);
    expect(res.body.sessionRequest).toBeDefined();
    expect(res.body.sessionRequest.status).toBe('CONFIRMED');
  });

  it('mentee can propose a new time', async () => {
    const res = await request(app).post(`/api/sessions/${sessionId}/propose`).set('Authorization', `Bearer ${menteeToken}`).send({ sessionDate: '2026-06-02', sessionTime: '16:00', notes: 'Can we move one day later?' });
    expect(res.status).toBe(201);
    expect(res.body.proposal).toBeDefined();
    proposalId = res.body.proposal.id;

    // session status should be PROPOSED when fetched
    const s = await request(app).get('/api/sessions').set('Authorization', `Bearer ${menteeToken}`);
    const found = s.body.sessionRequests.find((r) => r.id === sessionId);
    expect(found).toBeDefined();
    expect(found.status).toBe('PROPOSED');
  });

  it('mentor accepts the proposal and session updates', async () => {
    const res = await request(app).patch(`/api/sessions/${sessionId}/proposals/${proposalId}/status`).set('Authorization', `Bearer ${mentorToken}`).send({ status: 'ACCEPTED' });
    expect(res.status).toBe(200);
    expect(res.body.sessionRequest).toBeDefined();
    expect(res.body.sessionRequest.status).toBe('CONFIRMED');
    // session date/time should be updated
    expect(res.body.sessionRequest.sessionDate).toBe('2026-06-02');
    expect(res.body.sessionRequest.sessionTime).toBe('16:00');
  });
});
