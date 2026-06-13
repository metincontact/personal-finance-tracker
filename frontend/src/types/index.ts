export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'utilities'
  | 'other';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: Category;
  merchant: string;
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

export interface MonthlySummary {
  month: string;
  totalSpent: number;
  byCategory: Partial<Record<Category, number>>;
  budgets: Budget[];
}
