import { Router } from 'express';
import { generateMentorResponse } from '../services/mentorAi.js';

const router = Router();

router.post('/mentor-response', async (req, res, next) => {
  try {
    const { prompt } = req.body ?? {};

    if (typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt must be a string.' });
    }

    const response = await generateMentorResponse(prompt);
    return res.json({ response });
  } catch (error) {
    return next(error);
  }
});

export default router;