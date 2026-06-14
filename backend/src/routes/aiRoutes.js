import { Router } from 'express';
import { recommendMentors, generateMentorResponseForSession, generateMenteePrepSheet } from '../services/mentorAi.js';

const router = Router();

router.post('/mentor-response', async (req, res) => {
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

router.post('/recommend-mentors', async (req, res) => {
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
    return res.status(500).json({ message: error.message || 'AI error' });
  }
});

router.post('/generate-prep-sheet', async (req, res) => {
  try {
    const { studentInput } = req.body ?? {};
    const normalizedStudentInput = typeof studentInput === 'string' ? studentInput.trim() : '';

    if (!normalizedStudentInput) {
      return res.status(400).json({ error: 'studentInput is required.' });
    }

    const prepSheet = await generateMenteePrepSheet(normalizedStudentInput);
    const structuredPrepSheet = {
      summary: 'Here’s a clear session summary based on what you shared.',
      sections: [
        { title: 'Mentee Profile', body: normalizedStudentInput.slice(0, 280) || 'You shared your goals and what you want help with.' },
        { title: 'Core Concern', body: `What seems to be holding you back is: ${normalizedStudentInput.slice(0, 180) || 'the main issue you described'}.` },
        { title: 'The 3-Point Agenda', body: '1) Clarify your goals. 2) Identify the main blockers. 3) Plan your next steps with the mentor.' },
      ],
      rawMarkdown: prepSheet,
    };


    return res.json({ prepSheet: structuredPrepSheet });
  } catch (error) {
    console.error('Prep Sheet Gen Error:', error);
    console.error('Prep Sheet Gen Error Message:', error?.message);
    console.error('Prep Sheet Gen Error Status:', error?.status || error?.response?.status);

    const normalizedStudentInput = typeof req.body?.studentInput === 'string' ? req.body.studentInput.trim() : '';
    const fallbackPrepSheet = {
      summary: 'Here’s a fallback session summary based on what you shared.',
      sections: [
        { title: 'Mentee Profile', body: normalizedStudentInput.slice(0, 280) || 'You shared a goal, but it could not be processed by the AI provider.' },
        { title: 'Core Concern', body: normalizedStudentInput ? `What seems to be holding you back is: ${normalizedStudentInput.slice(0, 180)}.` : 'The AI provider is temporarily unavailable, so this fallback uses the information you entered.' },
        { title: 'The 3-Point Agenda', body: '1) Clarify your goals. 2) Review obstacles. 3) Plan next steps with the mentor.' },
      ],
      rawMarkdown: `**Fallback session summary**\n\nThe AI provider is temporarily unavailable.\n\n**What you shared**\n${normalizedStudentInput}`,
      fallback: true,
    };



    return res.status(200).json({ prepSheet: fallbackPrepSheet, warning: 'AI provider unavailable; returned fallback session summary.' });
  }
});

export default router;
