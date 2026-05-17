// AI smoke test: registers users, calls recommend-mentors, creates a session, and requests a session-aware mentor response
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
    console.log('Starting AI smoke test');
    const now = Date.now();
    const menteeEmail = `ai-mentee-${now}@example.com`;
    const mentorEmail = `ai-mentor-${now}@example.com`;

    console.log('Register mentee');
    let r = await req('/auth/register/mentee', 'POST', { name: 'AI Mentee', email: menteeEmail, password: 'password123', dreamCourse: 'computer science', classLevel: 'SS3', selectedVibes: ['friendly'] });
    console.log('/auth/register/mentee', r.status, r.body);
    if (r.status !== 201) throw new Error('mentee registration failed');
    const menteeToken = r.body.customToken;
    const menteeUid = r.body.user.uid;

    console.log('Register mentor');
    r = await req('/auth/register/mentor', 'POST', { name: 'AI Mentor', email: mentorEmail, password: 'password123', skills: ['computer science', 'programming'], selectedVibes: ['friendly'], bio: 'I teach CS' });
    console.log('/auth/register/mentor', r.status, r.body);
    if (r.status !== 201) throw new Error('mentor registration failed');
    const mentorUid = r.body.user.uid;

    console.log('Call recommend-mentors');
    r = await req('/ai/recommend-mentors', 'POST', { menteeId: menteeUid, limit: 5 });
    console.log('/ai/recommend-mentors', r.status, r.body);
    if (r.status !== 200) throw new Error('recommend-mentors failed');

    console.log('Create session as mentee');
    r = await req('/sessions', 'POST', { mentorId: mentorUid, topic: 'Programming help', sessionDate: '2026-05-20', sessionTime: '14:00' }, menteeToken);
    console.log('/sessions POST', r.status, r.body);
    if (r.status !== 201) throw new Error('session creation failed');
    const sessionId = r.body.sessionRequest.id;

    console.log('Request session-aware mentor response');
    r = await req('/ai/mentor-response', 'POST', { sessionId });
    console.log('/ai/mentor-response', r.status, r.body);
    if (r.status !== 200) throw new Error('mentor-response failed');

    console.log('AI smoke test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('AI smoke test failed:', err);
    process.exit(2);
  }
})();
