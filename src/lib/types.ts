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

export interface SavingsGoal {
  id: string;
  userId?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsTransaction {
  id: string;
  userId?: string;
  goalId?: string;
  goalTitle?: string;
  type: 'deposit' | 'withdraw'; // 'deposit' = setor tabungan, 'withdraw' = ambil tabungan
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export type GoldType =
  | 'Antam'
  | 'UBS'
  | 'Galeri 24'
  | 'Emas Digital'
  | 'Perhiasan'
  | 'Lotus Archi'
  | 'Dinar / Koin Emas'
  | 'Lainnya';

export type GoldKarat = '24K' | '22K' | '18K' | '16K' | '14K' | '10K';

export interface GoldSavings {
  id: string;
  userId?: string;
  type: GoldType;
  karat: GoldKarat;
  weightGrams: number;
  purchasePrice: number;
  pricePerGram: number;
  currentEstimatedPricePerGram?: number;
  purchaseDate: string; // YYYY-MM-DD
  storageLocation?: string;
  serialNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoldTransaction {
  id: string;
  userId?: string;
  goldId?: string;
  type: 'buy' | 'sell';
  goldType: GoldType;
  karat: GoldKarat;
  weightGrams: number;
  totalPrice: number;
  date: string;
  notes?: string;
  createdAt: string;
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
  savingsGoals?: SavingsGoal[];
  savingsTransactions?: SavingsTransaction[];
  goldSavings?: GoldSavings[];
  goldTransactions?: GoldTransaction[];
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
  totalSavings?: number;
  savingsThisMonth?: number;
  totalGoldGrams?: number;
  totalGoldEstimatedValue?: number;
}
