import express from 'express';
import cors from 'cors';
import transactionRoutes from './routes/transactions';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/transactions', transactionRoutes);

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
