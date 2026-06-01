import request from 'supertest';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import app from '../src/app.js';
import * as calendarEmail from '../src/lib/calendarEmail.js';

describe('session routes with calendar/email', () => {
  beforeEach(() => {
    vi.spyOn(calendarEmail, 'createCalendarEvent').mockResolvedValue({ id: 'evt-123', conferenceData: { entryPoints: [{ entryPointType: 'video', uri: 'https://meet.example/test' }] } });
    vi.spyOn(calendarEmail, 'sendEmail').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('confirming a session triggers calendar creation and emails', async () => {
    const m1 = await request(app).post('/api/auth/register/mentee').send({ name: 'Test Mentee', email: `t-${Date.now()}@example.com`, password: 'password123' });
    expect(m1.status).toBe(201);
    const menteeToken = m1.body.customToken;

    const m2 = await request(app).post('/api/auth/register/mentor').send({ name: 'Test Mentor', email: `m-${Date.now()}@example.com`, password: 'password123' });
    expect(m2.status).toBe(201);
    const mentorToken = m2.body.customToken;
    const mentorUid = m2.body.user.uid;

    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const c = await request(app).post('/api/sessions').set('Authorization', `Bearer ${menteeToken}`).send({ mentorId: mentorUid, topic: 'Test Topic', sessionDate: futureDate, sessionTime: '10:00' });
    expect(c.status).toBe(201);
    const sessionId = c.body.sessionRequest.id;

    const conf = await request(app).patch(`/api/sessions/${sessionId}/status`).set('Authorization', `Bearer ${mentorToken}`).send({ status: 'CONFIRMED' });
    expect(conf.status).toBe(200);

    expect(calendarEmail.createCalendarEvent).toHaveBeenCalled();
    expect(calendarEmail.sendEmail).toHaveBeenCalled();
  });
});
