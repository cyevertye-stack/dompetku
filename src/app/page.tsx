'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  formatDateIndonesian,
  formatMonthIndonesian,
  formatRupiah,
  getCurrentMonthString,
  getPreviousMonthString,
  getTodayString,
  getRangeDetails,
  RangeDetails,
} from '@/lib/formatters';
import {
  Category,
  DashboardMetrics,
  DashboardRange,
  GoldSavings,
  GoldTransaction,
  PaymentMethod,
  SavingsGoal,
  SavingsTransaction,
  ThemeMode,
  Transaction,
  TransactionFilter as FilterType,
  User,
} from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { Sidebar, TabKey } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { DashboardPeriodControl } from '@/components/dashboard/DashboardPeriodControl';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { BudgetAlertBanner } from '@/components/dashboard/BudgetAlertBanner';
import { ExpenseCharts } from '@/components/dashboard/ExpenseCharts';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { TransactionFilter } from '@/components/transactions/TransactionFilter';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal';
import { BudgetOverview } from '@/components/budgets/BudgetOverview';
import { MonthlyBudgetModal } from '@/components/budgets/MonthlyBudgetModal';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { ReportOverview } from '@/components/reports/ReportOverview';
import { ProfileSettingsView } from '@/components/profile/ProfileSettingsView';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AuthModal } from '@/components/auth/AuthModal';
import { SavingsView } from '@/components/savings/SavingsView';
import { TEMPLATE_CATEGORIES } from '@/lib/sample-data';
import { Calendar, RotateCcw } from 'lucide-react';

export default function DompetKuApp() {
  // Safe Date initialization on Client mount
  const [currentMonth, setCurrentMonth] = useState('2026-11');
  const [prevMonth, setPrevMonth] = useState('2026-10');
  const [todayStr, setTodayStr] = useState('2026-11-03');
  const [sevenDaysAgoStr, setSevenDaysAgoStr] = useState('2026-10-27');
  const [isMounted, setIsMounted] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Theme State (3 Color Modes: 'light' | 'dark' | 'pink')
  const [theme, setTheme] = useState<ThemeMode>('light');
  const darkMode = theme === 'dark';

  // App Main State
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [dashboardRange, setDashboardRange] = useState<DashboardRange>('1m');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthlyBudgets, setMonthlyBudgets] = useState<Record<string, number>>({});
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [savingsThisMonth, setSavingsThisMonth] = useState<number>(0);
  const [goldSavings, setGoldSavings] = useState<GoldSavings[]>([]);
  const [goldTransactions, setGoldTransactions] = useState<GoldTransaction[]>([]);
  const [totalGoldGrams, setTotalGoldGrams] = useState<number>(0);
  const [totalGoldEstimatedValue, setTotalGoldEstimatedValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Dialog State
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Confirm delete dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });

  // Filter for Transaction List tab
  const [txFilter, setTxFilter] = useState<FilterType>({
    search: '',
    categoryId: 'all',
    paymentMethod: 'all',
    month: '2026-11',
    sortBy: 'date-desc',
  });

  // Load all initial data for the current user
  const loadData = useCallback(async (userId?: string) => {
    try {
      setIsLoading(true);
      const userQuery = userId ? `?userId=${userId}` : '';

      // Local caching fallback per user
      const cacheKey = userId ? `dompetku-cache-${userId}` : 'dompetku-cache-default';
      let localCached: any = null;
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) localCached = JSON.parse(raw);
      } catch (e) {}

      const [txRes, catRes, budgetRes, savingsRes] = await Promise.all([
        fetch(`/api/transactions${userQuery}`),
        fetch(`/api/categories${userQuery}`),
        fetch(`/api/budgets${userQuery}`),
        fetch(`/api/savings${userQuery}`),
      ]);

      const [txData, catData, budgetData, savingsData] = await Promise.all([
        txRes.json(),
        catRes.json(),
        budgetRes.json(),
        savingsRes.json(),
      ]);

      if (txData.success && Array.isArray(txData.data)) {
        if (txData.data.length > 0) {
          setTransactions(txData.data);
        } else if (localCached?.transactions && localCached.transactions.length > 0) {
          const userCached = localCached.transactions.filter((t: any) => !userId || t.userId === userId);
          if (userCached.length > 0) {
            setTransactions(userCached);
          } else {
            setTransactions([]);
          }
        } else {
          setTransactions([]);
        }
      } else if (localCached?.transactions) {
        setTransactions(localCached.transactions.filter((t: any) => !userId || t.userId === userId));
      }

      if (catData.success && Array.isArray(catData.data) && catData.data.length > 0) {
        setCategories(catData.data);
      } else if (localCached?.categories && localCached.categories.length > 0) {
        setCategories(localCached.categories);
      } else if (catData.success && Array.isArray(catData.data)) {
        setCategories(catData.data);
      }

      if (budgetData.success && typeof budgetData.data === 'object') {
        setMonthlyBudgets(budgetData.data);
      } else if (localCached?.monthlyBudgets) {
        setMonthlyBudgets(localCached.monthlyBudgets);
      }

      if (savingsData.success && savingsData.data) {
        setSavingsGoals(Array.isArray(savingsData.data.goals) ? savingsData.data.goals : (localCached?.savingsGoals || []));
        setSavingsTransactions(Array.isArray(savingsData.data.transactions) ? savingsData.data.transactions : (localCached?.savingsTransactions || []));
        setTotalSavings(typeof savingsData.data.totalSavings === 'number' ? savingsData.data.totalSavings : (localCached?.totalSavings ?? 0));
        setSavingsThisMonth(typeof savingsData.data.savingsThisMonth === 'number' ? savingsData.data.savingsThisMonth : (localCached?.savingsThisMonth ?? 0));
        setGoldSavings(Array.isArray(savingsData.data.goldSavings) ? savingsData.data.goldSavings : (localCached?.goldSavings || []));
        setGoldTransactions(Array.isArray(savingsData.data.goldTransactions) ? savingsData.data.goldTransactions : (localCached?.goldTransactions || []));
        setTotalGoldGrams(typeof savingsData.data.totalGoldGrams === 'number' ? savingsData.data.totalGoldGrams : (localCached?.totalGoldGrams ?? 0));
        setTotalGoldEstimatedValue(typeof savingsData.data.totalGoldEstimatedValue === 'number' ? savingsData.data.totalGoldEstimatedValue : (localCached?.totalGoldEstimatedValue ?? 0));
      } else if (localCached) {
        setSavingsGoals(localCached.savingsGoals || []);
        setSavingsTransactions(localCached.savingsTransactions || []);
        setTotalSavings(localCached.totalSavings || 0);
        setSavingsThisMonth(localCached.savingsThisMonth || 0);
        setGoldSavings(localCached.goldSavings || []);
        setGoldTransactions(localCached.goldTransactions || []);
        setTotalGoldGrams(localCached.totalGoldGrams || 0);
        setTotalGoldEstimatedValue(localCached.totalGoldEstimatedValue || 0);
      }
    } catch (error) {
      console.error('Error loading DompetKu data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Synchronize local cache for the active user
  useEffect(() => {
    if (!isMounted || !currentUser) return;
    try {
      const cacheKey = `dompetku-cache-${currentUser.id}`;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          transactions,
          categories,
          monthlyBudgets,
          savingsGoals,
          savingsTransactions,
          totalSavings,
          savingsThisMonth,
          goldSavings,
          goldTransactions,
          totalGoldGrams,
          totalGoldEstimatedValue,
        })
      );
    } catch (e) {}
  }, [
    isMounted,
    currentUser,
    transactions,
    categories,
    monthlyBudgets,
    savingsGoals,
    savingsTransactions,
    totalSavings,
    savingsThisMonth,
    goldSavings,
    goldTransactions,
    totalGoldGrams,
    totalGoldEstimatedValue,
  ]);

  // Initialize client side state
  useEffect(() => {
    setIsMounted(true);
    const currM = getCurrentMonthString();
    const prevM = getPreviousMonthString(currM);
    const tday = getTodayString();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenStr = sevenDaysAgo.toISOString().split('T')[0];

    setCurrentMonth(currM);
    setPrevMonth(prevM);
    setTodayStr(tday);
    setSevenDaysAgoStr(sevenStr);
    setTxFilter((prev) => ({ ...prev, month: 'all' }));

    // Check Theme (Support 3 modes: light, dark, pink)
    try {
      const savedTheme = localStorage.getItem('dompetku-theme') as ThemeMode | null;
      if (savedTheme === 'pink') {
        setTheme('pink');
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add('pink');
      } else if (savedTheme === 'dark') {
        setTheme('dark');
        document.documentElement.classList.remove('pink', 'light');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark', 'pink');
        document.documentElement.classList.add('light');
      }
    } catch (e) {}

    // Restore Saved Active Tab so page refresh stays on current tab
    try {
      const savedTab = localStorage.getItem('dompetku-active-tab') as TabKey | null;
      const validTabs: TabKey[] = [
        'dashboard',
        'transactions',
        'budgets',
        'categories',
        'savings',
        'reports',
        'settings',
      ];
      if (savedTab && validTabs.includes(savedTab)) {
        setActiveTab(savedTab);
      }
    } catch (e) {}

    // Restore Saved Dashboard Range (1m, 3m, 6m, 1y, all)
    try {
      const savedRange = localStorage.getItem('dompetku-dashboard-range') as DashboardRange | null;
      if (savedRange && ['1m', '3m', '6m', '1y', 'all'].includes(savedRange)) {
        setDashboardRange(savedRange);
      }
    } catch (e) {}

    // Check User Session
    const savedUserStr = localStorage.getItem('dompetku-user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        setCurrentUser(u);
        loadData(u.id);
      } catch (e) {
        loadData();
      }
    } else {
      setIsLoading(false);
    }
  }, [loadData]);

  // Theme Handlers (3 Modes: light -> dark -> pink -> light)
  const applyTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark', 'pink', 'light');
      document.documentElement.classList.add(newTheme);
    }
    try {
      localStorage.setItem('dompetku-theme', newTheme);
    } catch (e) {}
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      applyTheme('dark');
    } else if (theme === 'dark') {
      applyTheme('pink');
    } else {
      applyTheme('light');
    }
  };

  // Tab Change Handler with Persistence
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('dompetku-active-tab', tab);
    } catch (e) {}
  };

  // Month Change Handler (memungkinkan cek bulan lalu / bulan kapan saja di dashboard)
  const handleChangeMonth = (newMonth: string) => {
    setCurrentMonth(newMonth);
    setPrevMonth(getPreviousMonthString(newMonth));
  };

  // Handler Ganti Rentang Dashboard (1 Bulan, 3 Bulan, 6 Bulan, 1 Tahun, Semua)
  const handleRangeChange = (newRange: DashboardRange) => {
    setDashboardRange(newRange);
    try {
      localStorage.setItem('dompetku-dashboard-range', newRange);
    } catch (e) {}
  };

  // Detail Rentang Tanggal & Bulan Dashboard
  const rangeDetails: RangeDetails = useMemo(() => {
    return getRangeDetails(currentMonth, dashboardRange);
  }, [currentMonth, dashboardRange]);

  // Transaksi yang masuk ke dalam rentang Dashboard aktif
  const rangeTransactions = useMemo(() => {
    if (dashboardRange === 'all') {
      return transactions;
    }
    return transactions.filter((t) => {
      if (!t.date) return false;
      if (rangeDetails.startDate && t.date < rangeDetails.startDate) return false;
      if (rangeDetails.endDate && t.date > rangeDetails.endDate) return false;
      return true;
    });
  }, [transactions, dashboardRange, rangeDetails]);

  // Kumpulan tahun yang tersedia dari transaksi + rentang aktif
  const availableYears = useMemo(() => {
    const yrs = new Set<number>([2024, 2025, 2026, 2027, 2028]);
    transactions.forEach((t) => {
      if (t.date) {
        const y = parseInt(t.date.split('-')[0], 10);
        if (!isNaN(y)) yrs.add(y);
      }
    });
    return Array.from(yrs).sort((a, b) => b - a);
  }, [transactions]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('dompetku-active-tab', activeTab);
      } catch (e) {}
    }
  }, [activeTab, isMounted]);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('dompetku-user');
    setCurrentUser(null);
    setTransactions([]);
    setCategories([]);
    setMonthlyBudgets({});
    setSavingsGoals([]);
    setSavingsTransactions([]);
    setTotalSavings(0);
    setSavingsThisMonth(0);
    setGoldSavings([]);
    setGoldTransactions([]);
    setTotalGoldGrams(0);
    setTotalGoldEstimatedValue(0);
  };

  // Dashboard Metrics Calculation
  const metrics: DashboardMetrics = useMemo(() => {
    // Pengeluaran & Pemasukan Periode Ini (disesuaikan dengan rangeTransactions)
    const totalThisMonth = rangeTransactions
      .filter((t) => t.type !== 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeThisMonth = rangeTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashflow = incomeThisMonth - totalThisMonth;

    const totalToday = transactions
      .filter((t) => t.type !== 'income' && t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeToday = transactions
      .filter((t) => t.type === 'income' && t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalThisWeek = transactions
      .filter((t) => t.type !== 'income' && t.date >= sevenDaysAgoStr && t.date <= todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeThisWeek = transactions
      .filter((t) => t.type === 'income' && t.date >= sevenDaysAgoStr && t.date <= todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    // Batas Anggaran untuk rentang yang dipilih
    let monthlyBudget = 0;
    if (dashboardRange === '1m') {
      monthlyBudget = monthlyBudgets[currentMonth] || 0;
    } else if (dashboardRange === 'all') {
      monthlyBudget = Object.values(monthlyBudgets).reduce((sum, b) => sum + b, 0);
    } else {
      const sumExplicit = rangeDetails.monthsList.reduce(
        (sum, m) => sum + (monthlyBudgets[m] || 0),
        0
      );
      if (sumExplicit > 0) {
        monthlyBudget = sumExplicit;
      } else if (monthlyBudgets[currentMonth]) {
        monthlyBudget = monthlyBudgets[currentMonth] * rangeDetails.monthsList.length;
      }
    }

    const remainingBudget = monthlyBudget > 0 ? monthlyBudget - totalThisMonth : 0;
    const budgetUsagePercent =
      monthlyBudget > 0 ? Math.round((totalThisMonth / monthlyBudget) * 100) : 0;

    // Perbandingan dengan periode sebelumnya berdurasi sama
    let previousMonthTotal = 0;
    if (dashboardRange === '1m') {
      const prevMonthTxs = transactions.filter(
        (t) => t.date.startsWith(prevMonth) && t.type !== 'income'
      );
      previousMonthTotal = prevMonthTxs.reduce((sum, t) => sum + t.amount, 0);
    } else if (rangeDetails.prevStartDate && rangeDetails.prevEndDate) {
      const prevTxs = transactions.filter(
        (t) =>
          t.type !== 'income' &&
          t.date &&
          t.date >= rangeDetails.prevStartDate &&
          t.date <= rangeDetails.prevEndDate
      );
      previousMonthTotal = prevTxs.reduce((sum, t) => sum + t.amount, 0);
    }

    const comparisonAmount = totalThisMonth - previousMonthTotal;
    const comparisonPercent =
      previousMonthTotal > 0
        ? Math.round(((totalThisMonth - previousMonthTotal) / previousMonthTotal) * 100)
        : 0;

    const catMap: Record<string, number> = {};
    rangeTransactions
      .filter((t) => t.type !== 'income')
      .forEach((t) => {
        catMap[t.categoryId] = (catMap[t.categoryId] || 0) + t.amount;
      });

    let topCatObj: { name: string; amount: number; color: string } | null = null;
    let maxAmount = 0;

    Object.entries(catMap).forEach(([catId, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        const cat = categories.find((c) => c.id === catId);
        topCatObj = {
          name: cat ? cat.name : 'Lain-lain',
          amount,
          color: cat ? cat.color : '#3B82F6',
        };
      }
    });

    return {
      totalThisMonth,
      incomeThisMonth,
      netCashflow,
      totalToday,
      incomeToday,
      totalThisWeek,
      incomeThisWeek,
      monthlyBudget,
      remainingBudget,
      budgetUsagePercent,
      totalTransactionsCount: rangeTransactions.length,
      topCategory: topCatObj,
      previousMonthTotal,
      comparisonPercent,
      comparisonAmount,
      range: dashboardRange,
      rangeLabel: rangeDetails.label,
      rangePeriodName: rangeDetails.periodName,
      totalSavings,
      savingsThisMonth,
      totalGoldGrams,
      totalGoldEstimatedValue,
    };
  }, [
    rangeTransactions,
    transactions,
    categories,
    monthlyBudgets,
    currentMonth,
    prevMonth,
    dashboardRange,
    rangeDetails,
    todayStr,
    sevenDaysAgoStr,
    totalSavings,
    savingsThisMonth,
    totalGoldGrams,
    totalGoldEstimatedValue,
  ]);

  // Filtered transactions for the Transaksi tab
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (txFilter.type && txFilter.type !== 'all') {
      list = list.filter((t) => (t.type || 'expense') === txFilter.type);
    }

    if (txFilter.search && txFilter.search.trim() !== '') {
      const q = txFilter.search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    if (txFilter.categoryId && txFilter.categoryId !== 'all') {
      list = list.filter((t) => t.categoryId === txFilter.categoryId);
    }

    if (txFilter.paymentMethod && txFilter.paymentMethod !== 'all') {
      list = list.filter((t) => t.paymentMethod === txFilter.paymentMethod);
    }

    if (txFilter.month && txFilter.month !== 'all') {
      if (txFilter.month.startsWith('-')) {
        const m = txFilter.month.substring(1);
        list = list.filter((t) => t.date.split('-')[1] === m);
      } else if (txFilter.month.length === 4) {
        list = list.filter((t) => t.date.startsWith(`${txFilter.month}-`));
      } else {
        list = list.filter((t) => t.date.startsWith(txFilter.month!));
      }
    }

    if (txFilter.startDate) {
      list = list.filter((t) => t.date >= txFilter.startDate!);
    }
    if (txFilter.endDate) {
      list = list.filter((t) => t.date <= txFilter.endDate!);
    }

    if (txFilter.sortBy === 'date-asc') {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (txFilter.sortBy === 'amount-desc') {
      list.sort((a, b) => b.amount - a.amount);
    } else if (txFilter.sortBy === 'amount-asc') {
      list.sort((a, b) => a.amount - b.amount);
    } else {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return list;
  }, [transactions, txFilter]);

  // Transaction CRUD handlers
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const payload = {
      ...data,
      userId: currentUser?.id,
    };

    if (editingTransaction) {
      const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTransaction.id ? result.data : t))
      );
      setEditingTransaction(null);
    } else {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setTransactions((prev) => [result.data, ...prev]);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Transaksi?',
      message: `Apakah Anda yakin ingin menghapus catatan "${tx.title}" sebesar ${formatRupiah(
        tx.amount
      )}? Data tidak dapat dipulihkan.`,
      onConfirm: async () => {
        const res = await fetch(`/api/transactions/${tx.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
          if (detailTransaction?.id === tx.id) setDetailTransaction(null);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Category CRUD handlers
  const handleSaveCategory = async (data: Omit<Category, 'id'>) => {
    const payload = {
      ...data,
      userId: currentUser?.id,
    };

    if (editingCategory) {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCategory.id, ...payload }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? result.data : c))
      );
      setEditingCategory(null);
    } else {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setCategories((prev) => [...prev, result.data]);
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Kategori?',
      message: `Hapus kategori "${cat.name}"? Kategori hanya dapat dihapus jika tidak memiliki transaksi terhubung.`,
      onConfirm: async () => {
        const res = await fetch(`/api/categories?id=${cat.id}`, {
          method: 'DELETE',
        });
        const result = await res.json();
        if (!res.ok) {
          alert(result.message || 'Gagal menghapus kategori');
        } else {
          setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // 1-Click Load Template Categories
  const handleLoadTemplateCategories = async () => {
    for (const tpl of TEMPLATE_CATEGORIES) {
      await handleSaveCategory(tpl);
    }
  };

  // Monthly Budget Save handler
  const handleSaveMonthlyBudget = async (amount: number) => {
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthYear: currentMonth,
        amount,
        userId: currentUser?.id,
      }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    setMonthlyBudgets((prev) => ({ ...prev, [currentMonth]: amount }));
  };

  // Excel Export Handler
  const handleExportExcel = async (filterParams: {
    periodLabel: string;
    month?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setIsExportingExcel(true);
      const res = await fetch('/api/export-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...filterParams,
          userId: currentUser?.id,
        }),
      });

      if (!res.ok) throw new Error('Gagal mengekspor laporan Excel');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DompetKu_${filterParams.periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      alert(err.message || 'Gagal mengekspor file Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleQuickExport = () => {
    handleExportExcel({
      periodLabel: `Bulan ${formatMonthIndonesian(currentMonth)}`,
      month: currentMonth,
    });
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/icon-192.png"
            alt="DompetKu"
            className="w-16 h-16 rounded-2xl shadow-xl shadow-blue-500/20 object-cover border border-white/10 animate-pulse"
          />
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mt-1" />
          <p className="text-xs font-bold tracking-wider uppercase text-slate-400">
            Memuat DompetKu...
          </p>
        </div>
      </div>
    );
  }

  // Dedicated Solid Auth Screen (No transparent overlay over dashboard)
  if (!currentUser) {
    return (
      <AuthModal
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadData(user.id);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        transactionCount={transactions.length}
        isOverBudget={metrics.remainingBudget < 0 && metrics.monthlyBudget > 0}
        currentUser={currentUser}
        darkMode={darkMode}
        theme={theme}
        onToggleDarkMode={toggleTheme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentMonth={currentMonth}
          currentUser={currentUser}
          darkMode={darkMode}
          theme={theme}
          activeTab={activeTab}
          onToggleDarkMode={toggleTheme}
          onToggleTheme={toggleTheme}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddTxModalOpen(true);
          }}
          onQuickExport={handleQuickExport}
          onOpenSettings={() => handleTabChange('settings')}
          onLogout={handleLogout}
          onMonthChange={handleChangeMonth}
          availableYears={availableYears}
        />

        {/* Scrollable Page Views */}
        <main className="flex-1 overflow-y-auto px-3.5 sm:px-8 py-4 sm:py-6 pb-28 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* VIEW 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div key="view-dashboard" className="space-y-6 animate-fade-slide">
                {/* Banner Peringatan jika melihat Bulan Lalu / Bulan Lain */}
                {currentMonth !== getCurrentMonthString() && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                      <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">
                          Melihat Periode: {formatMonthIndonesian(currentMonth)}
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                          Seluruh metrik, sisa anggaran, dan grafik otomatis menyesuaikan dengan periode ini.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChangeMonth(getCurrentMonthString())}
                      className="self-start sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Kembali ke Bulan Ini</span>
                    </button>
                  </div>
                )}

                {/* Greeting & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Ringkasan Pengeluaran Keuangan
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {currentUser ? `Halo, ${currentUser.name}!` : ''} Analisis {rangeDetails.periodName} • {rangeDetails.label}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-2xs">
                    Hari ini: {formatDateIndonesian(todayStr, true)}
                  </span>
                </div>

                {/* 0. Navigasi Periode & Rentang Multi-Bulan (1 Bulan, 3 Bulan, 6 Bulan, 1 Tahun, Semua) */}
                <DashboardPeriodControl
                  currentMonth={currentMonth}
                  onMonthChange={handleChangeMonth}
                  range={dashboardRange}
                  onRangeChange={handleRangeChange}
                  rangeDetails={rangeDetails}
                  availableYears={availableYears}
                  theme={theme}
                />

                {/* 1. Summary Metric Cards */}
                <SummaryCards
                  metrics={metrics}
                  currentMonth={currentMonth}
                  dashboardRange={dashboardRange}
                  rangePeriodName={rangeDetails.periodName}
                  onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                  onOpenSavings={(targetTab) => {
                    if (targetTab) {
                      try {
                        localStorage.setItem('dompetku-savings-subtab', targetTab);
                      } catch (e) {}
                    }
                    setActiveTab('savings');
                  }}
                />

                {/* 2. Budget Alert Banner */}
                <BudgetAlertBanner
                  monthlyBudget={metrics.monthlyBudget}
                  totalExpense={metrics.totalThisMonth}
                  remainingBudget={metrics.remainingBudget}
                  budgetUsagePercent={metrics.budgetUsagePercent}
                  periodName={rangeDetails.periodName}
                  onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                />

                {/* 3. Interactive Charts */}
                <ExpenseCharts
                  transactions={transactions}
                  categories={categories}
                  currentMonth={currentMonth}
                  dashboardRange={dashboardRange}
                  rangeDetails={rangeDetails}
                  darkMode={darkMode}
                  theme={theme}
                />

                {/* 4. Recent Transactions */}
                <RecentTransactions
                  transactions={rangeTransactions.length > 0 ? rangeTransactions : transactions}
                  categories={categories}
                  onOpenAddModal={() => {
                    setEditingTransaction(null);
                    setIsAddTxModalOpen(true);
                  }}
                  onSelectTransaction={(tx) => setDetailTransaction(tx)}
                  onViewAll={() => setActiveTab('transactions')}
                />
              </div>
            )}

            {/* VIEW 2: TRANSAKSI */}
            {activeTab === 'transactions' && (
              <div key="view-transactions" className="space-y-6 animate-fade-slide">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Riwayat & Catatan Transaksi
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Kelola seluruh daftar pengeluaran & pemasukan uang Anda dengan pencarian dan filter lengkap
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTransaction(null);
                      setIsAddTxModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-200 dark:shadow-none transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <span>+ Catat Transaksi</span>
                  </button>
                </div>

                {/* Search & Filter Component */}
                <TransactionFilter
                  filter={txFilter}
                  onChange={setTxFilter}
                  onReset={() =>
                    setTxFilter({
                      search: '',
                      type: 'all',
                      categoryId: 'all',
                      paymentMethod: 'all',
                      month: 'all',
                      sortBy: 'date-desc',
                    })
                  }
                  categories={categories}
                  availableYears={availableYears}
                />

                {/* Transaction List (Desktop Table / Mobile Cards) */}
                <TransactionList
                  transactions={filteredTransactions}
                  categories={categories}
                  onSelect={(tx) => setDetailTransaction(tx)}
                  onEdit={(tx) => {
                    setEditingTransaction(tx);
                    setIsAddTxModalOpen(true);
                  }}
                  onDelete={handleDeleteTransaction}
                  onAddNew={() => {
                    setEditingTransaction(null);
                    setIsAddTxModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* VIEW 3: ANGGARAN & BATAS */}
            {activeTab === 'budgets' && (
              <div key="view-budgets" className="space-y-6 animate-fade-slide">
                <BudgetOverview
                  monthlyBudget={metrics.monthlyBudget}
                  transactions={transactions}
                  categories={categories}
                  currentMonth={currentMonth}
                  onOpenMonthlyBudgetModal={() => setIsBudgetModalOpen(true)}
                  onEditCategory={(cat) => {
                    setEditingCategory(cat);
                    setIsCategoryModalOpen(true);
                  }}
                  onAddNewCategory={() => {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* VIEW 4: KATEGORI */}
            {activeTab === 'categories' && (
              <div key="view-categories" className="space-y-6 animate-fade-slide">
                <CategoryList
                  categories={categories}
                  transactions={transactions}
                  onAddNew={() => {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                  onEdit={(cat) => {
                    setEditingCategory(cat);
                    setIsCategoryModalOpen(true);
                  }}
                  onDelete={handleDeleteCategory}
                  onLoadTemplateCategories={handleLoadTemplateCategories}
                />
              </div>
            )}

            {/* VIEW: TABUNGAN & IMPIAN */}
            {activeTab === 'savings' && (
              <div key="view-savings" className="animate-fade-slide">
                <SavingsView
                  goals={savingsGoals}
                  transactions={savingsTransactions}
                  totalSavings={totalSavings}
                  savingsThisMonth={savingsThisMonth}
                  goldSavings={goldSavings}
                  goldTransactions={goldTransactions}
                  totalGoldGrams={totalGoldGrams}
                  totalGoldEstimatedValue={totalGoldEstimatedValue}
                  userId={currentUser?.id}
                  onRefresh={() => loadData(currentUser?.id)}
                />
              </div>
            )}

            {/* VIEW 5: LAPORAN & EKSPOR EXCEL */}
            {activeTab === 'reports' && (
              <div key="view-reports" className="space-y-6 animate-fade-slide">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Laporan Keuangan & Ekspor Microsoft Excel
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Analisis mendalam keuangan dan unduh buku kerja Microsoft Excel (.xlsx) 5 Sheet lengkap (Pemasukan, Pengeluaran, Tabungan & Portofolio Emas)
                  </p>
                </div>

                <ReportOverview
                  transactions={transactions}
                  categories={categories}
                  monthlyBudgets={monthlyBudgets}
                  onExportExcel={handleExportExcel}
                  isExporting={isExportingExcel}
                  currentMonth={currentMonth}
                />
              </div>
            )}

            {/* VIEW 6: PROFIL & PENGATURAN */}
            {activeTab === 'settings' && (
              <div key="view-settings" className="space-y-6 animate-fade-slide">
                <ProfileSettingsView
                  currentUser={currentUser}
                  onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
                  onLogout={handleLogout}
                  transactionCount={transactions.length}
                  totalSavingsValue={totalSavings + totalGoldEstimatedValue}
                  categoryCount={categories.length}
                  onRefreshData={() => loadData(currentUser?.id)}
                  theme={theme}
                  onSelectTheme={applyTheme}
                />
              </div>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddTxModalOpen(true);
          }}
        />
      </div>

      {/* Modals */}
      {/* 1. Transaction Add/Edit Modal */}
      <TransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => {
          setIsAddTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        initialData={editingTransaction}
      />

      {/* 2. Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={!!detailTransaction}
        onClose={() => setDetailTransaction(null)}
        transaction={detailTransaction}
        category={categories.find((c) => c.id === detailTransaction?.categoryId)}
        onEdit={(tx) => {
          setDetailTransaction(null);
          setEditingTransaction(tx);
          setIsAddTxModalOpen(true);
        }}
        onDelete={(tx) => {
          setDetailTransaction(null);
          handleDeleteTransaction(tx);
        }}
      />

      {/* 3. Monthly Budget Modal */}
      <MonthlyBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveMonthlyBudget}
        monthLabel={formatMonthIndonesian(currentMonth)}
        currentBudget={metrics.monthlyBudget}
      />

      {/* 4. Category Add/Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />

      {/* 5. Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
