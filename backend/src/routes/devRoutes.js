import express from 'express';
import process from 'node:process';
import { _getEmailPreviews } from '../lib/calendarEmail.js';

const router = express.Router();

// Only enable in non-production environments
if ((process.env.NODE_ENV || 'development') !== 'production') {
  router.get('/email-previews', (_req, res) => {
    const previews = _getEmailPreviews(50);
    res.json({ previews });
  });
}

export default router;
