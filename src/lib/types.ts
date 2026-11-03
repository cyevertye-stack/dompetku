export type PaymentMethod = 
  | 'Tunai'
  | 'Transfer Bank'
  | 'E-Wallet (GoPay, OVO, Dana, ShopeePay)'
  | 'Kartu Debit / Kredit'
  | 'Lainnya';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budgetLimit: number; // 0 = no specific limit
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
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
  monthYear: string; // YYYY-MM
  amount: number;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  monthlyBudgets: Record<string, number>; // key: "YYYY-MM", value: amount
}

export interface TransactionFilter {
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
  comparisonPercent: number; // positive = increased expense, negative = decreased
  comparisonAmount: number;
}
