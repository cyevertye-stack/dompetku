'use client';

import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  Clock,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles,
  PiggyBank,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';
import { DashboardMetrics } from '@/lib/types';

interface SummaryCardsProps {
  metrics: DashboardMetrics;
  onOpenBudgetModal: () => void;
  onOpenSavings?: () => void;
}

export function SummaryCards({ metrics, onOpenBudgetModal, onOpenSavings }: SummaryCardsProps) {
  const isOverBudget = metrics.monthlyBudget > 0 && metrics.remainingBudget < 0;
  const isNearBudget =
    metrics.monthlyBudget > 0 &&
    !isOverBudget &&
    metrics.budgetUsagePercent >= 80;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 1. Total Bulan Ini */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pengeluaran Bulan Ini
          </span>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatRupiah(metrics.totalThisMonth)}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {metrics.comparisonPercent !== 0 ? (
            <span
              className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded-md ${
                metrics.comparisonPercent > 0
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
              }`}
            >
              {metrics.comparisonPercent > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {Math.abs(metrics.comparisonPercent)}%
            </span>
          ) : (
            <span className="text-slate-400 font-medium">Sama</span>
          )}
          <span className="text-slate-400 dark:text-slate-500">vs bulan lalu</span>
        </div>
      </div>

      {/* 2. Hari Ini & Minggu Ini */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Hari Ini & Minggu Ini
          </span>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatRupiah(metrics.totalToday)}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Minggu Ini:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formatRupiah(metrics.totalThisWeek)}
          </span>
        </div>
      </div>

      {/* 3. Sisa Anggaran Bulanan */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Sisa Anggaran
          </span>
          <button
            onClick={onOpenBudgetModal}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Ubah Anggaran"
          >
            <Target className="w-4 h-4" />
          </button>
        </div>
        <div
          className={`mt-3 text-2xl font-black tracking-tight ${
            isOverBudget
              ? 'text-rose-600 dark:text-rose-400'
              : isNearBudget
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {metrics.monthlyBudget > 0 ? (
            isOverBudget ? (
              `- ${formatRupiah(Math.abs(metrics.remainingBudget))}`
            ) : (
              formatRupiah(metrics.remainingBudget)
            )
          ) : (
            'Belum diatur'
          )}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Batas: {metrics.monthlyBudget > 0 ? formatRupiah(metrics.monthlyBudget) : '-'}</span>
          {metrics.monthlyBudget > 0 && (
            <span
              className={`font-bold ${
                isOverBudget
                  ? 'text-rose-600 dark:text-rose-400'
                  : isNearBudget
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {metrics.budgetUsagePercent}% terpakai
            </span>
          )}
        </div>
      </div>

      {/* 4. Total Uang yang Ditabung */}
      <div
        onClick={onOpenSavings}
        className="relative bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-slate-900 rounded-2xl p-5 border border-emerald-300/60 dark:border-emerald-800/60 shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Tabungan & Emas
          </span>
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">
          {formatRupiah(metrics.totalSavings || 0)}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
          <span>
            {metrics.totalGoldGrams && metrics.totalGoldGrams > 0
              ? `+ ${metrics.totalGoldGrams} gr Emas`
              : `+${formatRupiah(metrics.savingsThisMonth || 0)} bln ini`}
          </span>
          <span className="text-[11px] underline opacity-80 group-hover:opacity-100">Kelola &rarr;</span>
        </div>
      </div>

      {/* 5. Kategori Terbesar */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Kategori Terbesar
          </span>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-xl font-black text-slate-900 dark:text-white truncate tracking-tight">
          {metrics.topCategory ? metrics.topCategory.name : 'Belum ada data'}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {metrics.topCategory ? formatRupiah(metrics.topCategory.amount) : '-'}
          </span>
          <span>{metrics.totalTransactionsCount} Transaksi</span>
        </div>
      </div>
    </div>
  );
}
