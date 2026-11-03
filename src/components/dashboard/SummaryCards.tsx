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
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';
import { DashboardMetrics } from '@/lib/types';

interface SummaryCardsProps {
  metrics: DashboardMetrics;
  onOpenBudgetModal: () => void;
}

export function SummaryCards({ metrics, onOpenBudgetModal }: SummaryCardsProps) {
  const isOverBudget = metrics.monthlyBudget > 0 && metrics.remainingBudget < 0;
  const isNearBudget =
    metrics.monthlyBudget > 0 &&
    !isOverBudget &&
    metrics.budgetUsagePercent >= 80;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Bulan Ini */}
      <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pengeluaran Bulan Ini
          </span>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
          {formatRupiah(metrics.totalThisMonth)}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {metrics.comparisonPercent !== 0 ? (
            <span
              className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded-md ${
                metrics.comparisonPercent > 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
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
          <span className="text-slate-400">vs bulan lalu</span>
        </div>
      </div>

      {/* 2. Hari Ini & Minggu Ini */}
      <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Hari Ini & Minggu Ini
          </span>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
          {formatRupiah(metrics.totalToday)}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>Minggu Ini:</span>
          <span className="font-bold text-slate-800">
            {formatRupiah(metrics.totalThisWeek)}
          </span>
        </div>
      </div>

      {/* 3. Sisa Anggaran Bulanan */}
      <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sisa Anggaran Bulanan
          </span>
          <button
            onClick={onOpenBudgetModal}
            className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            title="Ubah Anggaran"
          >
            <Target className="w-4 h-4" />
          </button>
        </div>
        <div
          className={`mt-3 text-2xl font-black tracking-tight ${
            isOverBudget
              ? 'text-rose-600'
              : isNearBudget
              ? 'text-amber-600'
              : 'text-emerald-600'
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
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>Batas: {metrics.monthlyBudget > 0 ? formatRupiah(metrics.monthlyBudget) : '-'}</span>
          {metrics.monthlyBudget > 0 && (
            <span
              className={`font-bold ${
                isOverBudget
                  ? 'text-rose-600'
                  : isNearBudget
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {metrics.budgetUsagePercent}% terpakai
            </span>
          )}
        </div>
      </div>

      {/* 4. Kategori Terbesar & Transaksi */}
      <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Kategori Terbesar
          </span>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-xl font-black text-slate-900 truncate tracking-tight">
          {metrics.topCategory ? metrics.topCategory.name : 'Belum ada data'}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-800">
            {metrics.topCategory ? formatRupiah(metrics.topCategory.amount) : '-'}
          </span>
          <span>{metrics.totalTransactionsCount} Transaksi</span>
        </div>
      </div>
    </div>
  );
}
