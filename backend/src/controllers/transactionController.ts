import { Request, Response } from 'express';
import * as svc from '../services/transactionService';

export async function getTransactions(_req: Request, res: Response) {
  try {
    const data = await svc.getAllTransactions();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

export async function getSummary(req: Request, res: Response) {
  const year  = parseInt(String(req.params['year']));
  const month = parseInt(String(req.params['month']));
  if (isNaN(year) || isNaN(month)) {
    res.status(400).json({ error: 'Invalid year or month' });
    return;
  }
  try {
    const data = await svc.getMonthlySummary(year, month);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
}

export async function getBudgets(req: Request, res: Response) {
  const year  = parseInt(String(req.params['year']));
  const month = parseInt(String(req.params['month']));
  if (isNaN(year) || isNaN(month)) {
    res.status(400).json({ error: 'Invalid year or month' });
    return;
  }
  try {
    const data = await svc.getBudgets(year, month);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
}

export async function updateBudget(req: Request, res: Response) {
  const { category } = req.params;
  const { limit } = req.body as { limit: number };
  if (!category || typeof limit !== 'number') {
    res.status(400).json({ error: 'category and limit required' });
    return;
  }
  try {
    const data = await svc.updateBudgetLimit(String(category), limit);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update budget' });
  }
}

export async function addTransaction(req: Request, res: Response) {
  const { date, amount, description, category, merchant } = req.body as {
    date: string; amount: number; description: string; category: string; merchant: string;
  };
  if (!date || !amount || !category || !merchant) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const data = await svc.createTransaction({ date, amount, description: description ?? merchant, category, merchant });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
}

export async function removeTransaction(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await svc.deleteTransaction(String(id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
}

export async function editTransaction(req: Request, res: Response) {
  const { id } = req.params;
  const { date, amount, description, category, merchant } = req.body as {
    date?: string; amount?: number; description?: string; category?: string; merchant?: string;
  };
  try {
    const data = await svc.updateTransaction(String(id), { date, amount, description, category, merchant });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
}

export async function getTrend(req: Request, res: Response) {
  const months = parseInt(String(req.params['months'] ?? '6'));
  try {
    const data = await svc.getMonthlyTrend(isNaN(months) ? 6 : months);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch trend' });
  }
}
