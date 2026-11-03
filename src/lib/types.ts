export type PaymentMethod = 
  | 'Tunai'
  | 'Transfer Bank'
  | 'E-Wallet (GoPay, OVO, Dana, ShopeePay)'
  | 'Kartu Debit / Kredit'
  | 'Lainnya';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  icon: string;
  color: string;
  budgetLimit: number; // 0 = no specific limit
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  userId?: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudget {
  userId?: string;
  monthYear: string; // YYYY-MM
  amount: number;
}

export interface AppState {
  users?: User[];
  transactions: Transaction[];
  categories: Category[];
  monthlyBudgets: Record<string, number>; // key: "userId:YYYY-MM" or "YYYY-MM"
}

export interface TransactionFilter {
  userId?: string;
  search?: string;
  categoryId?: string;
  paymentMethod?: string;
  month?: string; // YYYY-MM
  startDate?: string;
  endDate?: string;
  sortBy?: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface DashboardMetrics {
  totalThisMonth: number;
  totalToday: number;
  totalThisWeek: number;
  monthlyBudget: number;
  remainingBudget: number;
  budgetUsagePercent: number;
  totalTransactionsCount: number;
  topCategory: { name: string; amount: number; color: string } | null;
  previousMonthTotal: number;
  comparisonPercent: number;
  comparisonAmount: number;
}
