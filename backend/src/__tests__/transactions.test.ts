import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

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

describe('GET /api/transactions', () => {
  it('returns empty array initially', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/transactions', () => {
  it('creates a transaction successfully', async () => {
    const res = await request(app).post('/api/transactions').send({
      date: '2026-06-14',
      amount: 49.99,
      description: 'Test groceries',
      category: 'food',
      merchant: 'Tesco',
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      amount: 49.99,
      category: 'food',
      merchant: 'Tesco',
    });
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/transactions').send({
      description: 'Missing fields',
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('DELETE /api/transactions/:id', () => {
  it('deletes a transaction', async () => {
    const create = await request(app).post('/api/transactions').send({
      date: '2026-06-14',
      amount: 10,
      description: 'To delete',
      category: 'other',
      merchant: 'Test',
    });
    const id = create.body.id;

    const del = await request(app).delete(`/api/transactions/${id}`);
    expect(del.status).toBe(200);
    expect(del.body).toEqual({ success: true });
  });

  it('returns 500 for non-existent id', async () => {
    const res = await request(app).delete('/api/transactions/non-existent-id');
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/transactions/:id', () => {
  it('updates a transaction', async () => {
    const create = await request(app).post('/api/transactions').send({
      date: '2026-06-14',
      amount: 20,
      description: 'Original',
      category: 'food',
      merchant: 'Shop',
    });
    const id = create.body.id;

    const update = await request(app).patch(`/api/transactions/${id}`).send({
      amount: 25,
      merchant: 'Updated Shop',
    });
    expect(update.status).toBe(200);
    expect(update.body.amount).toBe(25);
    expect(update.body.merchant).toBe('Updated Shop');
  });
});

describe('GET /api/transactions/summary/:year/:month', () => {
  it('returns monthly summary', async () => {
    const res = await request(app).get('/api/transactions/summary/2026/6');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalSpent');
    expect(res.body).toHaveProperty('byCategory');
    expect(res.body).toHaveProperty('budgets');
  });

  it('returns 400 for invalid params', async () => {
    const res = await request(app).get('/api/transactions/summary/abc/xyz');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/transactions/budgets/:year/:month', () => {
  it('returns budget list', async () => {
    const res = await request(app).get('/api/transactions/budgets/2026/6');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PATCH /api/transactions/budgets/:category', () => {
  it('creates or updates a budget limit', async () => {
    const res = await request(app)
      .patch('/api/transactions/budgets/food')
      .send({ limit: 300 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ category: 'food', limit: 300 });
  });

  it('returns 400 when limit is missing', async () => {
    const res = await request(app)
      .patch('/api/transactions/budgets/food')
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/transactions/trend/:months', () => {
  it('returns trend data array', async () => {
    const res = await request(app).get('/api/transactions/trend/6');
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
  it('returns 400 when no file is uploaded', async () => {
    const res = await request(app).post('/api/import/pdf');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when uploaded file is not a PDF', async () => {
    const res = await request(app)
      .post('/api/import/pdf')
      .attach('file', Buffer.from('not a pdf'), { filename: 'test.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
