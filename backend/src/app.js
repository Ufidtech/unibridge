import express from 'express';
import cors from 'cors';
import process from 'node:process';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import devRoutes from './routes/devRoutes.js';

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN?.split(',').map((origin) => origin.trim()) || true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'unibridge-backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/dev', devRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((error, _req, res, next) => {
  console.error('❌ Error caught by middleware:', error.message);
  console.error('Stack:', error.stack);
  if (res.headersSent) {
    return next(error);
  }

  if (error?.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed.',
      details: error.issues,
    });
  }

  if (error?.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  res.status(500).json({ error: 'Internal server error.' });
});

export default app;