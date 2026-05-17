// Simple smoke test for unibridge backend (uses global fetch in Node 18+)
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
    console.log('Starting smoke test');

    const menteeEmail = `mentee-${Date.now()}@example.com`;
    const mentorEmail = `mentor-${Date.now()}@example.com`;

    console.log('Registering mentee:', menteeEmail);
    let r = await req('/auth/register/mentee', 'POST', {
      name: 'Test Mentee',
      email: menteeEmail,
      password: 'password123',
      school: 'Test High',
      classLevel: 'SS3'
    });
    console.log('mentee register', r.status, r.body);
    if (r.status !== 201) throw new Error('mentee registration failed');
    const menteeToken = r.body.customToken;
    const menteeUid = r.body.user.uid;

    console.log('Registering mentor:', mentorEmail);
    r = await req('/auth/register/mentor', 'POST', {
      name: 'Test Mentor',
      email: mentorEmail,
      password: 'password123',
    });
    console.log('mentor register', r.status, r.body);
    if (r.status !== 201) throw new Error('mentor registration failed');
    const mentorToken = r.body.customToken;
    const mentorUid = r.body.user.uid;

    console.log('Creating session request as mentee');
    r = await req('/sessions', 'POST', {
      mentorId: mentorUid,
      topic: 'Career choices',
      sessionDate: '2026-05-20',
      sessionTime: '10:00'
    }, menteeToken);
    console.log('create session', r.status, r.body);
    if (r.status !== 201) throw new Error('session creation failed');
    const sessionId = r.body.sessionRequest.id;

    console.log('Listing sessions as mentee');
    r = await req('/sessions', 'GET', null, menteeToken);
    console.log('mentee sessions', r.status, r.body);

    console.log('Listing sessions as mentor');
    r = await req('/sessions', 'GET', null, mentorToken);
    console.log('mentor sessions', r.status, r.body);

    console.log('Mentor confirms session');
    r = await req(`/sessions/${sessionId}/status`, 'PATCH', { status: 'CONFIRMED' }, mentorToken);
    console.log('patch status', r.status, r.body);

    console.log('Smoke test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(2);
  }
})();
