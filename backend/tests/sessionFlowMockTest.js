// Session flow integration test (uses preview-mode for calendar)
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
    console.log('Starting session flow mock test');
    const now = Date.now();
    const menteeEmail = `test-mentee-${now}@example.com`;
    const mentorEmail = `test-mentor-${now}@example.com`;

    // register mentee
    let r = await req('/auth/register/mentee', 'POST', { name: 'Test Mentee', email: menteeEmail, password: 'password123', school: 'Test HS', classLevel: 'SS3' });
    console.log('/auth/register/mentee', r.status);
    if (r.status !== 201) throw new Error('mentee registration failed');
    const menteeToken = r.body.customToken;
    const menteeUid = r.body.user.uid;

    // register mentor
    r = await req('/auth/register/mentor', 'POST', { name: 'Test Mentor', email: mentorEmail, password: 'password123' });
    console.log('/auth/register/mentor', r.status);
    if (r.status !== 201) throw new Error('mentor registration failed');
    const mentorToken = r.body.customToken;
    const mentorUid = r.body.user.uid;

    // create session as mentee
    r = await req('/sessions', 'POST', { mentorId: mentorUid, topic: 'Help me plan', sessionDate: '2026-05-25', sessionTime: '10:00' }, menteeToken);
    console.log('/sessions POST', r.status);
    if (r.status !== 201) throw new Error('session creation failed');
    const sessionId = r.body.sessionRequest.id;

    // confirm session as mentor
    r = await req(`/sessions/${sessionId}/status`, 'PATCH', { status: 'CONFIRMED' }, mentorToken);
    console.log('mentor confirm', r.status);
    if (r.status !== 200) throw new Error('mentor confirm failed');

    // reschedule as mentee
    r = await req(`/sessions/${sessionId}`, 'PATCH', { sessionDate: '2026-05-26', sessionTime: '11:00' }, menteeToken);
    console.log('reschedule', r.status);
    if (r.status !== 200) throw new Error('reschedule failed');

    // call calendar preview endpoint to assert payload
    r = await req('/debug/calendar-preview', 'POST', { summary: 'Test session', description: 'desc', startDate: '2026-05-26T11:00:00Z', endDate: '2026-05-26T12:00:00Z', attendees: [menteeEmail, mentorEmail] });
    console.log('/debug/calendar-preview', r.status, r.body && r.body.mode);
    if (r.status !== 200) throw new Error('calendar preview failed');

    console.log('Session flow mock test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Session flow mock test failed:', err);
    process.exit(2);
  }
})();
