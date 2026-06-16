import prisma from '../lib/prisma';
import type { Budget, MonthlySummary } from '../types';

export async function getAllTransactions() {
  return prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });
}

export async function getTransactionsByMonth(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);
  return prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: 'desc' },
  });
}

export async function getBudgets(year: number, month: number): Promise<Budget[]> {
  const [dbBudgets, transactions] = await Promise.all([
    prisma.budget.findMany(),
    getTransactionsByMonth(year, month),
  ]);

  return dbBudgets.map((b) => {
    const spent = transactions
      .filter((t) => t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      category: b.category,
      limit: b.limit,
      spent: parseFloat(spent.toFixed(2)),
    };
  });
}

export async function getMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
  const [transactions, budgets] = await Promise.all([
    getTransactionsByMonth(year, month),
    getBudgets(year, month),
  ]);

  const byCategory = transactions.reduce((acc, t) => {
    acc[t.category] = parseFloat(((acc[t.category] ?? 0) + t.amount).toFixed(2));
    return acc;
  }, {} as Record<string, number>);

  const totalSpent = parseFloat(
    transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)
  );

  return {
    month: `${year}-${String(month).padStart(2, '0')}`,
    totalSpent,
    byCategory,
    budgets,
  };
}

export async function updateBudgetLimit(category: string, limit: number) {
  return prisma.budget.upsert({
    where:  { category },
    update: { limit },
    create: { category, limit },
  });
}

export async function createTransaction(data: {
  date: string;
  amount: number;
  description: string;
  category: string;
  merchant: string;
}) {
  return prisma.transaction.create({
    data: {
      date:        new Date(data.date),
      amount:      data.amount,
      description: data.description,
      category:    data.category,
      merchant:    data.merchant,
    },
  });
}

export async function deleteTransaction(id: string) {
  return prisma.transaction.delete({ where: { id } });
}

export async function updateTransaction(id: string, data: {
  date?: string;
  amount?: number;
  description?: string;
  category?: string;
  merchant?: string;
}) {
  return prisma.transaction.update({
    where: { id },
    data: {
      ...(data.date        && { date: new Date(data.date) }),
      ...(data.amount      && { amount: data.amount }),
      ...(data.description && { description: data.description }),
      ...(data.category    && { category: data.category }),
      ...(data.merchant    && { merchant: data.merchant }),
    },
  });
}

export async function getMonthlyTrend(months: number): Promise<{ m: string; v: number }[]> {
  const now = new Date();
  const queries = Array.from({ length: months }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const label = date.toLocaleString('en-US', { month: 'short' });
    return getTransactionsByMonth(date.getFullYear(), date.getMonth() + 1).then(txns => ({
      m: label,
      v: parseFloat(txns.reduce((sum, t) => sum + t.amount, 0).toFixed(2)),
    }));
  });
  return Promise.all(queries);
}
