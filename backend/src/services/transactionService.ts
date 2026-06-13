import prisma from '../lib/prisma';
import type { Category, Budget, MonthlySummary } from '../types';

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
      category: b.category as Category,
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
    const cat = t.category as Category;
    acc[cat] = parseFloat(((acc[cat] ?? 0) + t.amount).toFixed(2));
    return acc;
  }, {} as Partial<Record<Category, number>>);

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
