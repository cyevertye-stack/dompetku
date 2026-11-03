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
} from '@/lib/formatters';
import {
  Category,
  DashboardMetrics,
  GoldSavings,
  GoldTransaction,
  PaymentMethod,
  SavingsGoal,
  SavingsTransaction,
  Transaction,
  TransactionFilter as FilterType,
  User,
} from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { Sidebar, TabKey } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
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
import { BackupRestore } from '@/components/settings/BackupRestore';
import { DeploymentGuideModal } from '@/components/settings/DeploymentGuideModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AuthModal } from '@/components/auth/AuthModal';
import { SavingsView } from '@/components/savings/SavingsView';
import { TEMPLATE_CATEGORIES } from '@/lib/sample-data';

export default function DompetKuApp() {
  // Safe Date initialization on Client mount
  const [currentMonth, setCurrentMonth] = useState('2026-11');
  const [prevMonth, setPrevMonth] = useState('2026-10');
  const [todayStr, setTodayStr] = useState('2026-11-03');
  const [sevenDaysAgoStr, setSevenDaysAgoStr] = useState('2026-10-27');
  const [isMounted, setIsMounted] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  // App Main State
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
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
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState(false);
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

      if (txData.success && Array.isArray(txData.data) && (txData.data.length > 0 || !localCached?.transactions)) {
        setTransactions(txData.data);
      } else if (localCached?.transactions) {
        setTransactions(localCached.transactions);
      }

      if (catData.success && Array.isArray(catData.data) && (catData.data.length > 0 || !localCached?.categories)) {
        setCategories(catData.data);
      } else if (localCached?.categories) {
        setCategories(localCached.categories);
      }

      if (budgetData.success && (Object.keys(budgetData.data || {}).length > 0 || !localCached?.monthlyBudgets)) {
        setMonthlyBudgets(budgetData.data);
      } else if (localCached?.monthlyBudgets) {
        setMonthlyBudgets(localCached.monthlyBudgets);
      }

      if (savingsData.success) {
        setSavingsGoals(savingsData.data.goals || localCached?.savingsGoals || []);
        setSavingsTransactions(savingsData.data.transactions || localCached?.savingsTransactions || []);
        setTotalSavings(savingsData.data.totalSavings ?? localCached?.totalSavings ?? 0);
        setSavingsThisMonth(savingsData.data.savingsThisMonth ?? localCached?.savingsThisMonth ?? 0);
        setGoldSavings(savingsData.data.goldSavings || localCached?.goldSavings || []);
        setGoldTransactions(savingsData.data.goldTransactions || localCached?.goldTransactions || []);
        setTotalGoldGrams(savingsData.data.totalGoldGrams ?? localCached?.totalGoldGrams ?? 0);
        setTotalGoldEstimatedValue(savingsData.data.totalGoldEstimatedValue ?? localCached?.totalGoldEstimatedValue ?? 0);
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
    setTxFilter((prev) => ({ ...prev, month: currM }));

    // Check Theme
    const savedTheme = localStorage.getItem('dompetku-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

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

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dompetku-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dompetku-theme', 'light');
    }
  };

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
    const currentMonthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
    const totalThisMonth = currentMonthTxs.reduce((sum, t) => sum + t.amount, 0);

    const totalToday = transactions
      .filter((t) => t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalThisWeek = transactions
      .filter((t) => t.date >= sevenDaysAgoStr && t.date <= todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyBudget = monthlyBudgets[currentMonth] || 0;
    const remainingBudget = monthlyBudget > 0 ? monthlyBudget - totalThisMonth : 0;
    const budgetUsagePercent =
      monthlyBudget > 0 ? Math.round((totalThisMonth / monthlyBudget) * 100) : 0;

    const prevMonthTxs = transactions.filter((t) => t.date.startsWith(prevMonth));
    const previousMonthTotal = prevMonthTxs.reduce((sum, t) => sum + t.amount, 0);
    const comparisonAmount = totalThisMonth - previousMonthTotal;
    const comparisonPercent =
      previousMonthTotal > 0
        ? Math.round(((totalThisMonth - previousMonthTotal) / previousMonthTotal) * 100)
        : 0;

    const catMap: Record<string, number> = {};
    currentMonthTxs.forEach((t) => {
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
      totalToday,
      totalThisWeek,
      monthlyBudget,
      remainingBudget,
      budgetUsagePercent,
      totalTransactionsCount: currentMonthTxs.length,
      topCategory: topCatObj,
      previousMonthTotal,
      comparisonPercent,
      comparisonAmount,
      totalSavings,
      savingsThisMonth,
      totalGoldGrams,
      totalGoldEstimatedValue,
    };
  }, [transactions, categories, monthlyBudgets, currentMonth, prevMonth, todayStr, sevenDaysAgoStr, totalSavings, savingsThisMonth, totalGoldGrams, totalGoldEstimatedValue]);

  // Filtered transactions for the Transaksi tab
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

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
      list = list.filter((t) => t.date.startsWith(txFilter.month!));
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
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold tracking-wider uppercase text-slate-300">
            Memuat DompetKu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors">
      {/* If not logged in, show Auth Screen */}
      {!currentUser && (
        <AuthModal
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            loadData(user.id);
          }}
        />
      )}

      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        transactionCount={transactions.length}
        isOverBudget={metrics.remainingBudget < 0 && metrics.monthlyBudget > 0}
        currentUser={currentUser}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentMonth={currentMonth}
          currentUser={currentUser}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddTxModalOpen(true);
          }}
          onQuickExport={handleQuickExport}
          onOpenSettings={() => setActiveTab('settings')}
          onLogout={handleLogout}
        />

        {/* Scrollable Page Views */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* VIEW 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Greeting & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Ringkasan Pengeluaran Keuangan
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {currentUser ? `Halo, ${currentUser.name}!` : ''} Pantau dan kelola arus kas keluar Anda secara real-time
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-2xs">
                    Hari ini: {formatDateIndonesian(todayStr, true)}
                  </span>
                </div>

                {/* 1. Summary Metric Cards */}
                <SummaryCards
                  metrics={metrics}
                  onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                  onOpenSavings={() => setActiveTab('savings')}
                />

                {/* 2. Budget Alert Banner */}
                <BudgetAlertBanner
                  monthlyBudget={metrics.monthlyBudget}
                  totalExpense={metrics.totalThisMonth}
                  remainingBudget={metrics.remainingBudget}
                  budgetUsagePercent={metrics.budgetUsagePercent}
                  onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                />

                {/* 3. Interactive Charts */}
                <ExpenseCharts
                  transactions={transactions}
                  categories={categories}
                  currentMonth={currentMonth}
                />

                {/* 4. Recent Transactions */}
                <RecentTransactions
                  transactions={transactions}
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
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Riwayat & Catatan Transaksi
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Kelola seluruh daftar pengeluaran uang Anda dengan pencarian dan filter lengkap
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTransaction(null);
                      setIsAddTxModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-200 dark:shadow-none transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <span>+ Catat Pengeluaran</span>
                  </button>
                </div>

                {/* Search & Filter Component */}
                <TransactionFilter
                  filter={txFilter}
                  onChange={setTxFilter}
                  onReset={() =>
                    setTxFilter({
                      search: '',
                      categoryId: 'all',
                      paymentMethod: 'all',
                      month: currentMonth,
                      sortBy: 'date-desc',
                    })
                  }
                  categories={categories}
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
              <div className="space-y-6 animate-in fade-in duration-300">
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
              <div className="space-y-6 animate-in fade-in duration-300">
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
            )}

            {/* VIEW 5: LAPORAN & EKSPOR EXCEL */}
            {activeTab === 'reports' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Laporan Keuangan & Ekspor Microsoft Excel
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Analisis mendalam pengeluaran dan unduh buku kerja Microsoft Excel (.xlsx) 3 Sheet profesional
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

            {/* VIEW 6: PENGATURAN & CLOUD */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Pengaturan, Cadangan & Database Cloud
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Kelola akun Anda ({currentUser?.email}), backup data, serta panduan database Supabase
                  </p>
                </div>

                <BackupRestore
                  onRefreshData={() => loadData(currentUser?.id)}
                  onOpenDeploymentGuide={() => setIsDeploymentGuideOpen(true)}
                />
              </div>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
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

      {/* 5. Deployment Guide Modal */}
      <DeploymentGuideModal
        isOpen={isDeploymentGuideOpen}
        onClose={() => setIsDeploymentGuideOpen(false)}
      />

      {/* 6. Confirm Dialog */}
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
