'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Target, ArrowRight } from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface BudgetAlertBannerProps {
  monthlyBudget: number;
  totalExpense: number;
  remainingBudget: number;
  budgetUsagePercent: number;
  onOpenBudgetModal: () => void;
}

export function BudgetAlertBanner({
  monthlyBudget,
  totalExpense,
  remainingBudget,
  budgetUsagePercent,
  onOpenBudgetModal,
}: BudgetAlertBannerProps) {
  if (monthlyBudget <= 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-900/60 border border-blue-200/80 dark:border-blue-900/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              Batas Anggaran Bulanan Belum Ditentukan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tentukan batas anggaran bulan ini untuk mengontrol pengeluaran dan mencegah overbudget.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>Atur Anggaran Sekarang</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const isOverBudget = remainingBudget < 0 || budgetUsagePercent > 100;
  const isNearBudget = !isOverBudget && budgetUsagePercent >= 80;

  // Determine styles
  let bgColor = 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200';
  let progressColor = 'bg-emerald-500';
  let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
  let title = 'Pengeluaran Masih Terkendali Aman';
  let message = `Anda telah menggunakan ${budgetUsagePercent}% dari batas anggaran bulanan (${formatRupiah(
    totalExpense
  )} dari ${formatRupiah(monthlyBudget)}).`;

  if (isOverBudget) {
    bgColor = 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/60 text-rose-950 dark:text-rose-200';
    progressColor = 'bg-rose-600';
    icon = <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
    title = 'PERINGATAN: Anggaran Bulan Ini Sudah Terlampaui!';
    message = `Pengeluaran Anda telah melebihi batas anggaran sebesar ${formatRupiah(
      Math.abs(remainingBudget)
    )} (${budgetUsagePercent}% terpakai). Harap rem pengeluaran non-esensial!`;
  } else if (isNearBudget) {
    bgColor = 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60 text-amber-950 dark:text-amber-200';
    progressColor = 'bg-amber-500';
    icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
    title = 'Perhatian: Pengeluaran Mendekati Batas Anggaran';
    message = `Anda sudah memakai ${budgetUsagePercent}% dari total anggaran. Sisa anggaran hanya tinggal ${formatRupiah(
      remainingBudget
    )}.`;
  }

  return (
    <div className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-xs ${bgColor}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon}
          <div>
            <h4 className="text-sm font-bold tracking-tight">{title}</h4>
            <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{message}</p>
          </div>
        </div>
        <button
          onClick={onOpenBudgetModal}
          className="self-start sm:self-auto px-3 py-1.5 bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-lg border border-slate-200/60 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          Kelola Batas
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 space-y-1.5">
        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-semibold opacity-80">
          <span>{formatRupiah(totalExpense)}</span>
          <span>{budgetUsagePercent}% dari {formatRupiah(monthlyBudget)}</span>
        </div>
      </div>
    </div>
  );
}
