import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Finance Tracker API',
    version: '1.0.0',
    endpoints: {
      health:       'GET /api/health',
      transactions: 'GET /api/transactions',
      summary:      'GET /api/transactions/summary/:year/:month',
      budgets:      'GET /api/transactions/budgets/:year/:month',
    },
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
