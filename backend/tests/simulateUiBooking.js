// Simulate frontend booking using backend API: register dev mentee & mentor, then create a session as the mentee
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
    console.log('Simulate UI booking');
    const now = Date.now();
    const menteeEmail = `ui-mentee-${now}@example.com`;
    const mentorEmail = `ui-mentor-${now}@example.com`;

    let r = await req('/auth/register/mentee', 'POST', { name: 'UI Mentee', email: menteeEmail, password: 'password123', school: 'Test HS', classLevel: 'SS3' });
    console.log('mentee register', r.status, JSON.stringify(r.body, null, 2));
    if (r.status !== 201) return;
    const menteeToken = r.body.customToken;
    const menteeUid = r.body.user.uid;

    r = await req('/auth/register/mentor', 'POST', { name: 'UI Mentor', email: mentorEmail, password: 'password123' });
    console.log('mentor register', r.status, JSON.stringify(r.body, null, 2));
    if (r.status !== 201) return;
    const mentorUid = r.body.user.uid;

    r = await req('/sessions', 'POST', { mentorId: mentorUid, topic: 'UI booking test', sessionDate: '2026-05-28', sessionTime: '14:00', timezone: 'UTC' }, menteeToken);
    console.log('create session', r.status, JSON.stringify(r.body, null, 2));

    console.log('Done');
  } catch (err) {
    console.error('simulateUiBooking failed', err);
  }
})();
