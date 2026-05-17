// Session flow interactive script (prints responses; avoids explicit process.exit to reduce Win libuv assertion noise)
const base = 'http://localhost:3001/api';

async function req(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  return { status: res.status, body: json };
}

(async () => {
  try {
    console.log('Starting session flow interactive script');
    const now = Date.now();
    const menteeEmail = `interactive-mentee-${now}@example.com`;
    const mentorEmail = `interactive-mentor-${now}@example.com`;

    // register mentee
    let r = await req('/auth/register/mentee', 'POST', { name: 'Interactive Mentee', email: menteeEmail, password: 'password123', school: 'Test HS', classLevel: 'SS3' });
    console.log('/auth/register/mentee', r.status, JSON.stringify(r.body, null, 2));
    if (r.status !== 201) return;
    const menteeToken = r.body.customToken;
    const menteeUid = r.body.user.uid;

    // register mentor
    r = await req('/auth/register/mentor', 'POST', { name: 'Interactive Mentor', email: mentorEmail, password: 'password123' });
    console.log('/auth/register/mentor', r.status, JSON.stringify(r.body, null, 2));
    if (r.status !== 201) return;
    const mentorToken = r.body.customToken;
    const mentorUid = r.body.user.uid;

    // create session as mentee
    r = await req('/sessions', 'POST', { mentorId: mentorUid, topic: 'Help me plan', sessionDate: '2026-05-25', sessionTime: '10:00' }, menteeToken);
    console.log('/sessions POST', r.status, JSON.stringify(r.body, null, 2));
    if (r.status !== 201) return;
    const sessionId = r.body.sessionRequest.id;

    // confirm session as mentor
    r = await req(`/sessions/${sessionId}/status`, 'PATCH', { status: 'CONFIRMED' }, mentorToken);
    console.log('mentor confirm', r.status, JSON.stringify(r.body, null, 2));
    if (r.status !== 200) return;

    // reschedule as mentee
    r = await req(`/sessions/${sessionId}`, 'PATCH', { sessionDate: '2026-05-26', sessionTime: '11:00' }, menteeToken);
    console.log('reschedule', r.status, JSON.stringify(r.body, null, 2));
    if (r.status !== 200) return;

    // fetch final session as mentee
    r = await req('/sessions', 'GET', null, menteeToken);
    console.log('mentee sessions list', r.status, JSON.stringify(r.body, null, 2));

    // fetch final session as mentor
    r = await req('/sessions', 'GET', null, mentorToken);
    console.log('mentor sessions list', r.status, JSON.stringify(r.body, null, 2));

    // call calendar preview endpoint
    r = await req('/debug/calendar-preview', 'POST', { summary: 'Test session', description: 'desc', startDate: '2026-05-26T11:00:00Z', endDate: '2026-05-26T12:00:00Z', attendees: [menteeEmail, mentorEmail] });
    console.log('/debug/calendar-preview', r.status, JSON.stringify(r.body, null, 2));

    console.log('Session flow interactive script finished');
  } catch (err) {
    console.error('Session flow interactive script failed:', err);
  }
})();
