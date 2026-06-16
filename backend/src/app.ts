import express from 'express';
import cors from 'cors';
import transactionRoutes from './routes/transactions';
import importRoutes from './routes/import';
import authRoutes from './routes/auth';
import { requireAuth } from './middleware/auth';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', requireAuth, transactionRoutes);
app.use('/api/import', requireAuth, importRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ name: 'Finance Tracker API', version: '1.0.0' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
