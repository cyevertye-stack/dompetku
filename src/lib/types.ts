export type ThemeMode = 'light' | 'dark' | 'pink';

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

export type GoldKarat = string;

export interface GoldSavings {
  id: string;
  userId?: string;
  type: GoldType;
  karat: string; // Tulis manual, misal: "24K (99.9%)", "Kadar 750 (18K)", "Kadar 700 (17K)", "375 (9K)", dll.
  jewelryType?: string; // Cincin, Kalung, Gelang, Anting, Liontin, dll.
  itemName?: string; // Nama perhiasan / model barang
  storeName?: string; // Toko Emas / Surat Emas
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
  karat: string;
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
  type?: 'expense' | 'income'; // 'expense' = pengeluaran, 'income' = pemasukan
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
  type?: 'all' | 'expense' | 'income';
  categoryId?: string;
  paymentMethod?: string;
  month?: string; // YYYY-MM
  startDate?: string;
  endDate?: string;
  sortBy?: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export type DashboardRange = '1m' | '3m' | '6m' | '1y' | 'all';

export interface DashboardMetrics {
  totalThisMonth: number; // Pengeluaran bulan/periode ini
  incomeThisMonth: number; // Pemasukan bulan/periode ini
  netCashflow: number; // Pemasukan - Pengeluaran
  totalToday: number;
  totalThisWeek: number;
  incomeToday: number;
  incomeThisWeek: number;
  monthlyBudget: number;
  remainingBudget: number;
  budgetUsagePercent: number;
  totalTransactionsCount: number;
  topCategory: { name: string; amount: number; color: string } | null;
  previousMonthTotal: number;
  comparisonPercent: number;
  comparisonAmount: number;
  range?: DashboardRange;
  rangeLabel?: string;
  rangePeriodName?: string;
  totalSavings?: number;
  savingsThisMonth?: number;
  totalGoldGrams?: number;
  totalGoldEstimatedValue?: number;
}
