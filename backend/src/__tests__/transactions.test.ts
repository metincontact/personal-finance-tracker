import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const token = jwt.sign({ sub: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
const auth = { Authorization: `Bearer ${token}` };

beforeAll(async () => {
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
});

afterAll(async () => {
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.$disconnect();
});

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /api/auth/login', () => {
  it('returns 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns token for correct password', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: process.env.ADMIN_PASSWORD || 'finance2026' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('GET /api/transactions', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });

  it('returns empty array initially', async () => {
    const res = await request(app).get('/api/transactions').set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/transactions', () => {
  it('creates a transaction successfully', async () => {
    const res = await request(app).post('/api/transactions').set(auth).send({
      date: '2026-06-14',
      amount: 49.99,
      description: 'Test groceries',
      category: 'food',
      merchant: 'Biedronka',
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ amount: 49.99, category: 'food', merchant: 'Biedronka' });
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/transactions').set(auth).send({ description: 'Missing fields' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('DELETE /api/transactions/:id', () => {
  it('deletes a transaction', async () => {
    const create = await request(app).post('/api/transactions').set(auth).send({
      date: '2026-06-14', amount: 10, description: 'To delete', category: 'other', merchant: 'Test',
    });
    const id = create.body.id;
    const del = await request(app).delete(`/api/transactions/${id}`).set(auth);
    expect(del.status).toBe(200);
    expect(del.body).toEqual({ success: true });
  });

  it('returns 500 for non-existent id', async () => {
    const res = await request(app).delete('/api/transactions/non-existent-id').set(auth);
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/transactions/:id', () => {
  it('updates a transaction', async () => {
    const create = await request(app).post('/api/transactions').set(auth).send({
      date: '2026-06-14', amount: 20, description: 'Original', category: 'food', merchant: 'Shop',
    });
    const id = create.body.id;
    const update = await request(app).patch(`/api/transactions/${id}`).set(auth).send({ amount: 25, merchant: 'Updated Shop' });
    expect(update.status).toBe(200);
    expect(update.body.amount).toBe(25);
    expect(update.body.merchant).toBe('Updated Shop');
  });
});

describe('GET /api/transactions/summary/:year/:month', () => {
  it('returns monthly summary', async () => {
    const res = await request(app).get('/api/transactions/summary/2026/6').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalSpent');
    expect(res.body).toHaveProperty('byCategory');
    expect(res.body).toHaveProperty('budgets');
  });

  it('returns 400 for invalid params', async () => {
    const res = await request(app).get('/api/transactions/summary/abc/xyz').set(auth);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/transactions/budgets/:year/:month', () => {
  it('returns budget list', async () => {
    const res = await request(app).get('/api/transactions/budgets/2026/6').set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PATCH /api/transactions/budgets/:category', () => {
  it('creates or updates a budget limit', async () => {
    const res = await request(app).patch('/api/transactions/budgets/food').set(auth).send({ limit: 1500 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ category: 'food', limit: 1500 });
  });

  it('returns 400 when limit is missing', async () => {
    const res = await request(app).patch('/api/transactions/budgets/food').set(auth).send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/transactions/trend/:months', () => {
  it('returns trend data array', async () => {
    const res = await request(app).get('/api/transactions/trend/6').set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(6);
    expect(res.body[0]).toHaveProperty('m');
    expect(res.body[0]).toHaveProperty('v');
  });
});

describe('GET unknown route', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/import/pdf', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/import/pdf');
    expect(res.status).toBe(401);
  });

  it('returns 400 when no file is uploaded', async () => {
    const res = await request(app).post('/api/import/pdf').set(auth);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when uploaded file is not a PDF', async () => {
    const res = await request(app).post('/api/import/pdf').set(auth)
      .attach('file', Buffer.from('not a pdf'), { filename: 'test.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
