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
  Coins,
  ShieldCheck,
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

  const isCashflowPositive = metrics.netCashflow >= 0;

  return (
    <div>
      {/* 1. VERSI MOBILE (CARD RINGKAS, ELEGAN, TIDAK BERDEMPET & TIDAK MEMAKAN LAYAR) */}
      <div className="block sm:hidden space-y-3">
        {/* Master Cashflow Hero Card */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
            <span>Sisa Saldo Kas Bulan Ini</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isCashflowPositive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isCashflowPositive ? 'Surplus Kas' : 'Defisit Kas'}
            </span>
          </div>

          <div
            className={`text-2xl font-black tracking-tight my-2 ${
              isCashflowPositive ? 'text-white' : 'text-rose-400'
            }`}
          >
            {formatRupiah(metrics.netCashflow || 0)}
          </div>

          {/* 2 Kolom Pemasukan & Pengeluaran */}
          <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                🟢 Pemasukan
              </span>
              <span className="font-extrabold text-sm text-white">
                +{formatRupiah(metrics.incomeThisMonth || 0)}
              </span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">
                🔴 Pengeluaran
              </span>
              <span className="font-extrabold text-sm text-white">
                -{formatRupiah(metrics.totalThisMonth || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* 2 Kolom Ringkas: Sisa Anggaran & Tabungan */}
        <div className="grid grid-cols-2 gap-3">
          {/* Anggaran */}
          <div
            onClick={onOpenBudgetModal}
            className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Sisa Anggaran</span>
              <Target className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div
              className={`text-sm font-black truncate ${
                isOverBudget
                  ? 'text-rose-600'
                  : isNearBudget
                  ? 'text-amber-600'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {metrics.monthlyBudget > 0
                ? isOverBudget
                  ? `- ${formatRupiah(Math.abs(metrics.remainingBudget))}`
                  : formatRupiah(metrics.remainingBudget)
                : 'Belum diatur'}
            </div>
          </div>

          {/* Tabungan & Emas */}
          <div
            onClick={onOpenSavings}
            className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Tabungan & Emas</span>
              <PiggyBank className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 truncate">
              {formatRupiah(metrics.totalSavings || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. VERSI DESKTOP (5 KOLOM LENGKAP & MEWAH) */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* 1. Pemasukan Bulan Ini */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pemasukan Bulan Ini
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            +{formatRupiah(metrics.incomeThisMonth || 0)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Hari ini:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              +{formatRupiah(metrics.incomeToday || 0)}
            </span>
          </div>
        </div>

        {/* 2. Pengeluaran Bulan Ini */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pengeluaran Bulan Ini
            </span>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            -{formatRupiah(metrics.totalThisMonth || 0)}
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

        {/* 3. Sisa Saldo Kas (Cashflow Bersih) */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sisa Saldo Kas
            </span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`mt-3 text-2xl font-black tracking-tight ${
              isCashflowPositive
                ? 'text-slate-900 dark:text-white'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatRupiah(metrics.netCashflow || 0)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate">Arus Kas:</span>
            <span
              className={`font-bold ${
                isCashflowPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isCashflowPositive ? 'Surplus / Sehat' : 'Defisit Kas'}
            </span>
          </div>
        </div>

        {/* 4. Sisa Anggaran Bulanan */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sisa Anggaran
            </span>
            <button
              onClick={onOpenBudgetModal}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
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

        {/* 5. Total Uang yang Ditabung & Emas */}
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
                ? `${metrics.totalGoldGrams} gr Emas`
                : `+${formatRupiah(metrics.savingsThisMonth || 0)} bln ini`}
            </span>
            <span className="text-[11px] underline opacity-80 group-hover:opacity-100">Kelola &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
}
