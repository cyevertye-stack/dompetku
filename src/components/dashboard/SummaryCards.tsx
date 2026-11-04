'use client';

import React, { useState, useEffect } from 'react';
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
import { formatRupiah, formatMonthIndonesian, getCurrentMonthString } from '@/lib/formatters';
import { DashboardMetrics } from '@/lib/types';

export type SavingsCardMode = 'total' | 'money' | 'gold';

interface SummaryCardsProps {
  metrics: DashboardMetrics;
  onOpenBudgetModal: () => void;
  onOpenSavings?: (targetSubTab?: 'money' | 'gold') => void;
  currentMonth?: string;
}

export function SummaryCards({
  metrics,
  onOpenBudgetModal,
  onOpenSavings,
  currentMonth,
}: SummaryCardsProps) {
  const [savingsMode, setSavingsMode] = useState<SavingsCardMode>('total');
  const todayMonth = React.useMemo(() => getCurrentMonthString(), []);
  const isCustomMonth = Boolean(currentMonth && currentMonth !== todayMonth);
  const monthName = currentMonth ? formatMonthIndonesian(currentMonth) : '';

  // Load saved savings card mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dompetku-savings-summary-mode') as SavingsCardMode | null;
      if (saved === 'total' || saved === 'money' || saved === 'gold') {
        setSavingsMode(saved);
      }
    } catch (e) {}
  }, []);

  const handleModeChange = (mode: SavingsCardMode) => {
    setSavingsMode(mode);
    try {
      localStorage.setItem('dompetku-savings-summary-mode', mode);
    } catch (e) {}
  };

  const handleCardClick = () => {
    if (onOpenSavings) {
      const targetSubTab: 'money' | 'gold' = savingsMode === 'gold' ? 'gold' : 'money';
      try {
        localStorage.setItem('dompetku-savings-subtab', targetSubTab);
      } catch (e) {}
      onOpenSavings(targetSubTab);
    }
  };

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
            <span>{isCustomMonth ? `Sisa Saldo Kas (${monthName})` : 'Sisa Saldo Kas Bulan Ini'}</span>
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
                🟢 {isCustomMonth ? `Pemasukan (${monthName})` : 'Pemasukan'}
              </span>
              <span className="font-extrabold text-sm text-white">
                +{formatRupiah(metrics.incomeThisMonth || 0)}
              </span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">
                🔴 {isCustomMonth ? `Pengeluaran (${monthName})` : 'Pengeluaran'}
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
            onClick={handleCardClick}
            className={`rounded-2xl p-3.5 border shadow-xs cursor-pointer active:scale-98 transition-all duration-300 flex flex-col justify-between ${
              savingsMode === 'gold'
                ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-800/60'
                : savingsMode === 'money'
                ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-800/60'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div>
              <div
                key={`mob-header-${savingsMode}`}
                className="flex items-center justify-between text-slate-400 mb-1 animate-smooth-switch"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                  {savingsMode === 'gold'
                    ? 'Tab. Emas'
                    : savingsMode === 'money'
                    ? 'Tab. Uang'
                    : 'Tabungan & Emas'}
                </span>
                {savingsMode === 'gold' ? (
                  <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : savingsMode === 'money' ? (
                  <PiggyBank className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                )}
              </div>
              <div key={`mob-val-${savingsMode}`} className="text-sm font-black truncate animate-smooth-switch">
                {savingsMode === 'gold' ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    {metrics.totalGoldEstimatedValue && metrics.totalGoldEstimatedValue > 0
                      ? formatRupiah(metrics.totalGoldEstimatedValue)
                      : `${metrics.totalGoldGrams || 0} gr`}
                  </span>
                ) : savingsMode === 'money' ? (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {formatRupiah(metrics.totalSavings || 0)}
                  </span>
                ) : (
                  <span className="text-teal-700 dark:text-teal-400">
                    {formatRupiah((metrics.totalSavings || 0) + (metrics.totalGoldEstimatedValue || 0))}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Switcher */}
            <div
              className="flex items-center gap-1 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => handleModeChange('total')}
                className={`flex-1 py-0.5 rounded text-[9px] font-bold transition-all duration-200 cursor-pointer active:scale-90 ${
                  savingsMode === 'total'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Total
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('money')}
                className={`flex-1 py-0.5 rounded text-[9px] font-bold transition-all duration-200 cursor-pointer active:scale-90 ${
                  savingsMode === 'money'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Uang
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('gold')}
                className={`flex-1 py-0.5 rounded text-[9px] font-bold transition-all duration-200 cursor-pointer active:scale-90 ${
                  savingsMode === 'gold'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Emas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VERSI DESKTOP (5 KOLOM LENGKAP & MEWAH) */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* 1. Pemasukan Bulan Ini */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md card-interactive flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {isCustomMonth ? `Pemasukan (${monthName})` : 'Pemasukan Bulan Ini'}
              </span>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl transition-transform duration-200 hover:scale-110">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              +{formatRupiah(metrics.incomeThisMonth || 0)}
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Hari ini:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              +{formatRupiah(metrics.incomeToday || 0)}
            </span>
          </div>
        </div>

        {/* 2. Pengeluaran Bulan Ini */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md card-interactive flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {isCustomMonth ? `Pengeluaran (${monthName})` : 'Pengeluaran Bulan Ini'}
              </span>
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl transition-transform duration-200 hover:scale-110">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              -{formatRupiah(metrics.totalThisMonth || 0)}
            </div>
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
            <span className="text-slate-400 dark:text-slate-500">vs bulan sebelumnya</span>
          </div>
        </div>

        {/* 3. Sisa Saldo Kas (Cashflow Bersih) */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md card-interactive flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Sisa Saldo Kas
              </span>
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl transition-transform duration-200 hover:scale-110">
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
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md card-interactive flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Sisa Anggaran
              </span>
              <button
                onClick={onOpenBudgetModal}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-xl transition-all duration-150 cursor-pointer text-xs flex items-center gap-1 font-semibold active:scale-90"
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
          onClick={handleCardClick}
          className={`relative rounded-2xl p-5 border shadow-xs hover:shadow-md card-interactive transition-all duration-300 cursor-pointer group flex flex-col justify-between ${
            savingsMode === 'gold'
              ? 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white dark:to-slate-900 border-amber-300/60 dark:border-amber-800/60'
              : savingsMode === 'money'
              ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-slate-900 border-emerald-300/60 dark:border-emerald-800/60'
              : 'bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-white dark:to-slate-900 border-teal-300/60 dark:border-teal-800/60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <div
                key={`title-${savingsMode}`}
                className="flex items-center gap-1.5 min-w-0 animate-smooth-switch"
              >
                {savingsMode === 'gold' ? (
                  <Coins className="w-4 h-4 text-amber-500 shrink-0 transition-transform duration-200 group-hover:rotate-12" />
                ) : savingsMode === 'money' ? (
                  <PiggyBank className="w-4 h-4 text-emerald-500 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                ) : (
                  <Sparkles className="w-4 h-4 text-teal-500 shrink-0 transition-transform duration-200 group-hover:rotate-12" />
                )}
                <span
                  className={`text-xs font-bold uppercase tracking-wider truncate transition-colors duration-300 ${
                    savingsMode === 'gold'
                      ? 'text-amber-700 dark:text-amber-400'
                      : savingsMode === 'money'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-teal-700 dark:text-teal-400'
                  }`}
                >
                  {savingsMode === 'gold'
                    ? 'Tab. Emas'
                    : savingsMode === 'money'
                    ? 'Tab. Uang'
                    : 'Tabungan & Emas'}
                </span>
              </div>

              {/* Mode Switcher Pill */}
              <div
                className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handleModeChange('total')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer active:scale-90 ${
                    savingsMode === 'total'
                      ? 'bg-teal-600 text-white shadow-xs scale-100'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:scale-105'
                  }`}
                  title="Total Semua Tabungan & Emas"
                >
                  Total
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('money')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer active:scale-90 ${
                    savingsMode === 'money'
                      ? 'bg-emerald-600 text-white shadow-xs scale-100'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:scale-105'
                  }`}
                  title="Tabungan Uang Tunai"
                >
                  Uang
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('gold')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer active:scale-90 ${
                    savingsMode === 'gold'
                      ? 'bg-amber-500 text-white shadow-xs scale-100'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:scale-105'
                  }`}
                  title="Tabungan Logam Mulia Emas"
                >
                  Emas
                </button>
              </div>
            </div>

            {/* Nominal Display with Smooth Switch Animation */}
            <div key={`val-${savingsMode}`} className="animate-smooth-switch">
              {savingsMode === 'gold' ? (
                <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-300 tracking-tight transition-colors duration-300">
                    {metrics.totalGoldEstimatedValue && metrics.totalGoldEstimatedValue > 0
                      ? formatRupiah(metrics.totalGoldEstimatedValue)
                      : `${metrics.totalGoldGrams || 0} gr`}
                  </span>
                  {metrics.totalGoldEstimatedValue && metrics.totalGoldEstimatedValue > 0 && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30 animate-pop">
                      {metrics.totalGoldGrams || 0} gr
                    </span>
                  )}
                </div>
              ) : savingsMode === 'money' ? (
                <div className="mt-3 text-2xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight transition-colors duration-300">
                  {formatRupiah(metrics.totalSavings || 0)}
                </div>
              ) : (
                <div className="mt-3 text-2xl font-black text-teal-800 dark:text-teal-300 tracking-tight transition-colors duration-300">
                  {formatRupiah((metrics.totalSavings || 0) + (metrics.totalGoldEstimatedValue || 0))}
                </div>
              )}
            </div>
          </div>

          {/* Subtitle / Footer with Smooth Switch */}
          <div
            key={`footer-${savingsMode}`}
            className={`mt-2.5 flex items-center justify-between text-xs font-semibold animate-smooth-switch transition-colors duration-300 ${
              savingsMode === 'gold'
                ? 'text-amber-700 dark:text-amber-400'
                : savingsMode === 'money'
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-teal-700 dark:text-teal-400'
            }`}
          >
            <span className="truncate">
              {savingsMode === 'gold'
                ? `${metrics.totalGoldGrams || 0} gr Emas Fisik`
                : savingsMode === 'money'
                ? metrics.savingsThisMonth && metrics.savingsThisMonth > 0
                  ? `+${formatRupiah(metrics.savingsThisMonth)} bln ini`
                  : 'Tabungan Kas / Impian'
                : metrics.totalGoldGrams && metrics.totalGoldGrams > 0
                ? `${formatRupiah(metrics.totalSavings || 0)} • ${metrics.totalGoldGrams} gr Emas`
                : `+${formatRupiah(metrics.savingsThisMonth || 0)} bln ini`}
            </span>
            <span className="text-[11px] underline opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1">
              Kelola &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
