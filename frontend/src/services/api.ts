import axios from 'axios';
import type { Transaction, Budget, MonthlySummary } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const getTransactions = (): Promise<Transaction[]> =>
  api.get<Transaction[]>('/transactions').then((r) => r.data);

export const getMonthlySummary = (year: number, month: number): Promise<MonthlySummary> =>
  api.get<MonthlySummary>(`/transactions/summary/${year}/${month}`).then((r) => r.data);

export const getBudgets = (year: number, month: number): Promise<Budget[]> =>
  api.get<Budget[]>(`/transactions/budgets/${year}/${month}`).then((r) => r.data);

export const updateBudget = (category: string, limit: number): Promise<void> =>
  api.patch(`/transactions/budgets/${category}`, { limit }).then((r) => r.data);

export const addTransaction = (data: {
  date: string; amount: number; description: string; category: string; merchant: string;
}): Promise<void> =>
  api.post('/transactions', data).then((r) => r.data);

export const deleteTransaction = (id: string): Promise<void> =>
  api.delete(`/transactions/${id}`).then((r) => r.data);

export const updateTransaction = (id: string, data: {
  date?: string; amount?: number; description?: string; category?: string; merchant?: string;
}): Promise<void> =>
  api.patch(`/transactions/${id}`, data).then((r) => r.data);

export const getMonthlyTrend = (months: number): Promise<{ m: string; v: number }[]> =>
  api.get<{ m: string; v: number }[]>(`/transactions/trend/${months}`).then((r) => r.data);
