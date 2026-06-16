import axios from 'axios';
import type { Transaction, Budget, MonthlySummary } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (password: string): Promise<{ token: string }> =>
  api.post<{ token: string }>('/auth/login', { password }).then(r => r.data);

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

export const importPDF = (file: File): Promise<{ imported: number; skipped: number }> => {
  const form = new FormData();
  form.append('file', file);
  return api.post<{ imported: number; skipped: number }>('/import/pdf', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};
