import express from 'express';
import path from 'node:path';
import { apiRouter } from './routes.js';

export const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve public directory statically
app.use(express.static(path.resolve(process.cwd(), 'public')));

// API router
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', store: 'VELORA', timestamp: new Date().toISOString() });
});

export default app;
