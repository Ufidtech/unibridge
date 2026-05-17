import { Router } from 'express';
import { generateMentorResponse, recommendMentors, generateMentorResponseForSession } from '../services/mentorAi.js';

const router = Router();

router.post('/mentor-response', async (req, res, next) => {
  try {
    const { prompt, sessionId } = req.body ?? {};

    if (!prompt && !sessionId) {
      return res.status(400).json({ error: 'prompt or sessionId is required.' });
    }

    const response = await generateMentorResponseForSession({ sessionId, prompt });
    return res.json({ response });
  } catch (error) {
    // if the error has remainingRetries attached, return it in the response
    const remaining = error && (error.remainingRetries || error.remaining_retries || null);
    const payload = { message: error.message || 'AI error' };
    if (typeof remaining === 'number') payload.remainingRetries = remaining;
    return res.status(503).json(payload);
  }
});

router.post('/recommend-mentors', async (req, res, next) => {
  try {
    const { menteeId, limit } = req.body ?? {};
    if (!menteeId) return res.status(400).json({ error: 'menteeId is required' });

    const mentors = await recommendMentors(menteeId, limit ?? 5);
    // ensure mentor emails are included (recommendMentors now includes email)
    const out = mentors.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email || null,
      university: m.university,
      level: m.level,
      bio: m.bio,
      skills: m.skills,
      rating: m.rating,
      reviews: m.reviews,
      responseTime: m.responseTime,
      score: m.score,
      breakdown: m.breakdown,
    }));
    return res.json({ mentors: out });
  } catch (error) {
    return next(error);
  }
});

export default router;