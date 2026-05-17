import process from 'node:process';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { firestore } from '../lib/firebase.js';

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function buildPrompt(userPrompt) {
  return `
You are the Unibridge Senior Mentor, a knowledgeable "big brother/sister" figure.
Your mission is to guide Nigerian secondary school students into the world of tech and university.

RULES:
1. TONE: Warm, encouraging, and relatable. Use light Nigerian slang where appropriate (e.g., "No shaking," "You've got this").
2. CONTEXT: Always consider the Nigerian educational system (JAMB subject combinations, Post-UTME, and the importance of high CGPA in 100L).
3. CLARITY: Use Markdown headers (###) and bullet points.
4. ACTION: If they are in SS3, remind them about JAMB. If they are in SS1, tell them to focus on Math and Physics.

STUDENT QUESTION: ${userPrompt}
`;
}

function fallbackReply(userPrompt) {
  return `### Quick guidance

- You asked: ${userPrompt}
- I can help with course choice, JAMB prep, and mentor matching.
- Set \`GEMINI_API_KEY\` in \`backend/.env\` to enable live AI replies.
`;
}

export async function generateMentorResponse(userPrompt) {
  if (!userPrompt || !userPrompt.trim()) {
    throw new Error('A prompt is required.');
  }

  if (!genAI) {
    return fallbackReply(userPrompt);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  try {
    const result = await safeGenerate(model, buildPrompt(userPrompt.trim()));
    return result.response.text();
  } catch (err) {
    console.error('Generative AI failed, falling back:', err && err.message ? err.message : err);
    return fallbackReply(userPrompt);
  }
}

// Helper: attempt generation with retry/backoff on quota/429 errors, then throw if still failing
async function safeGenerate(model, prompt, maxAttempts = 3) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      attempt += 1;
      const res = await model.generateContent(prompt);
      return res;
    } catch (err) {
      const msg = String(err && (err.message || err));
      // detect quota/429
      const is429 = /429|Too Many Requests|quota/i.test(msg);
      const retrySeconds = parseRetrySeconds(msg);
      const remaining = Math.max(0, maxAttempts - attempt);
      if (!is429 || attempt >= maxAttempts) {
        // include remaining info in thrown error for visibility
        const e = new Error((err && err.message) || String(err));
        e.remainingRetries = remaining;
        throw e;
      }
      // wait for specified retry delay if present, otherwise exponential backoff (seconds)
      const waitMs = (typeof retrySeconds === 'number' && !Number.isNaN(retrySeconds)) ? Math.ceil(retrySeconds * 1000) : Math.min(2000 * attempt, 8000);
      console.warn(`Generative AI rate-limited (attempt ${attempt}). ${remaining} retry(ies) left. Waiting ${waitMs}ms then retrying.`);
      await new Promise((res) => setTimeout(res, waitMs));
      // loop to retry
    }
  }
  throw new Error('Generation attempts exhausted');
}

function parseRetrySeconds(msg) {
  if (!msg) return null;
  // try structured retryDelay: "8s" or "0s"
  const mJson = msg.match(/retryDelay"\s*:\s*"?(\d+(?:\.\d+)?)(ms|s)?"?/i);
  if (mJson && mJson[1]) {
    const val = parseFloat(mJson[1]);
    const unit = (mJson[2] || 's').toLowerCase();
    return unit === 'ms' ? val / 1000 : val;
  }

  // look for human-readable 'Please retry in 69.98ms' or 'Please retry in 8s'
  const m = msg.match(/retry\s*(?:in|after)\s*(\d+(?:\.\d+)?)(ms|s|seconds|second)?/i);
  if (m && m[1]) {
    const v = parseFloat(m[1]);
    const u = (m[2] || 'ms').toLowerCase();
    if (u === 'ms') return v / 1000;
    if (u === 's' || /second/.test(u)) return v;
    // default to seconds
    return v;
  }

  return null;
}

// Improved NLP-based ranking for recommending mentors
  export async function recommendMentors(menteeId, { limit = 5 } = {}) {
    if (!menteeId) throw new Error('menteeId is required');

    const menteeDoc = await firestore.collection('menteeProfiles').doc(menteeId).get();
    const mentee = menteeDoc.exists ? menteeDoc.data() : {};

    // Helpers
    function toTokens(input) {
      if (!input) return new Set();
      return new Set(
        String(input)
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((t) => t.length > 1),
      );
    }

    function jaccard(aSet, bSet) {
      const a = Array.from(aSet);
      const b = new Set(bSet);
      const inter = a.filter((x) => b.has(x)).length;
      const union = new Set([...a, ...Array.from(bSet)]).size;
      return union === 0 ? 0 : inter / union;
    }

    function parseResponseTime(rt) {
      if (!rt) return null;
      const s = String(rt).toLowerCase();
      const m = s.match(/(\d+(?:\.\d+)?)\s*(min|mins|minute|minutes|h|hr|hrs|hour|hours|day|days)/);
      if (!m) return null;
      const val = parseFloat(m[1]);
      const unit = m[2];
      if (/min|mins|minute|minutes/.test(unit)) return val / 60; // hours
      if (/h|hr|hrs|hour|hours/.test(unit)) return val;
      if (/day|days/.test(unit)) return val * 24;
      return null;
    }

    // Mentor candidates
    const userSnapshot = await firestore.collection('users').where('role', '==', 'MENTOR').get();
    const candidates = [];

    const menteeDreamTokens = toTokens(mentee.dreamCourse || '');
    const menteeInterests = Array.isArray(mentee.interests) ? mentee.interests.map((s) => String(s).toLowerCase()) : [];
    const menteeVibes = new Set(mentee.selectedVibes || []);

    for (const userDoc of userSnapshot.docs) {
      const profileDoc = await firestore.collection('mentorProfiles').doc(userDoc.id).get();
      if (!profileDoc.exists) continue;
      const profile = profileDoc.data();

      // tokens and sets
      const skillTokens = new Set((profile.skills || []).flatMap((s) => String(s).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)));
      const bioTokens = toTokens(profile.bio || '');

      // measures
      const dreamSkillJaccard = jaccard(menteeDreamTokens, skillTokens);
      const interestSkillJaccard = jaccard(new Set(menteeInterests), skillTokens);
      const bioMatch = jaccard(menteeDreamTokens, bioTokens);

      // vibes overlap
      const mentorVibes = new Set(profile.selectedVibes || []);
      let vibeMatches = 0;
      for (const v of menteeVibes) if (mentorVibes.has(v)) vibeMatches++;

      // rating and reviews
      const rating = Number(profile.rating || 0);
      const reviews = Number(profile.reviews || 0);

      // availability: lower response time (hours) => higher availability score
      const hours = parseResponseTime(profile.responseTime);
      const availabilityScore = hours == null ? 0.5 : 1 / (1 + hours); // between ~0..1

      // Weighting scheme (tunable)
      const weights = {
        dreamSkill: 4.0,
        interestSkill: 2.0,
        bio: 1.0,
        vibes: 1.5,
        rating: 2.0,
        reviews: 0.5,
        availability: 1.5,
      };

      const rawScore =
        dreamSkillJaccard * weights.dreamSkill +
        interestSkillJaccard * weights.interestSkill +
        bioMatch * weights.bio +
        (vibeMatches / Math.max(1, (menteeVibes.size || 1))) * weights.vibes +
        (rating / 5) * weights.rating +
        Math.min(reviews / 100, 1) * weights.reviews +
        availabilityScore * weights.availability;

      candidates.push({
        id: userDoc.id,
        name: userDoc.data().name,
        email: userDoc.data().email || null,
  university: profile.universityName || profile.university || null,
        level: profile.level,
        bio: profile.bio,
        skills: profile.skills || [],
        rating,
        reviews,
        responseTime: profile.responseTime || null,
        score: rawScore,
        breakdown: {
          dreamSkillJaccard,
          interestSkillJaccard,
          bioMatch,
          vibeMatches,
          rating,
          reviews,
          availabilityScore,
        },
      });
    }

    // normalize scores to 0..1 for presentation
    const maxScore = candidates.reduce((m, c) => Math.max(m, c.score), 0) || 1;
    candidates.forEach((c) => {
      c.score = Math.round((c.score / maxScore) * 1000) / 1000; // 3 decimals
    });

    candidates.sort((a, b) => b.score - a.score || b.rating - a.rating);
    return candidates.slice(0, limit);
}

// Generate a mentor response for a booked session. If a sessionId is provided we
// load the session, mentor and mentee info and include context in the prompt.
export async function generateMentorResponseForSession({ sessionId, prompt }) {
  if (!sessionId && !prompt) throw new Error('sessionId or prompt required');

  let session = null;
  if (sessionId) {
    const s = await firestore.collection('sessionRequests').doc(sessionId).get();
    session = s.exists ? s.data() : null;
  }

  const composedPrompt = session
    ? `You are a mentor responding to a session booking. Session details:\n- Topic: ${session.topic}\n- Mentee: ${session.mentee?.name} (${session.mentee?.email})\n- Mentor: ${session.mentor?.name} (${session.mentor?.email})\n\nPlease write a warm, action-oriented message confirming the session and giving next steps.`
    : prompt;

  if (!genAI) {
    // fallback: craft a reasonable reply from session data
    if (!session) return fallbackReply(prompt || 'Hello');

    return `### Session confirmation\n\nHello ${session.mentee.name},\n\nThanks for booking a session with ${session.mentor.name} on ${session.sessionDate} at ${session.sessionTime}. ${session.mentor.name} suggests you prepare by: \n\n- Bringing specific questions about ${session.topic}.\n- Sharing any past projects or results to discuss.\n\nSee you then!`;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  try {
    const result = await safeGenerate(model, buildPrompt(composedPrompt));
    return result.response.text();
  } catch (err) {
    console.error('Generative AI for session failed, falling back:', err && err.message ? err.message : err);
    if (!session) return fallbackReply(prompt || 'Hello');
    return `### Session confirmation\n\nHello ${session.mentee.name},\n\nThanks for booking a session with ${session.mentor.name} on ${session.sessionDate} at ${session.sessionTime}. ${session.mentor.name} suggests you prepare by: \n\n- Bringing specific questions about ${session.topic}.\n- Sharing any past projects or results to discuss.\n\nSee you then!`;
  }
}