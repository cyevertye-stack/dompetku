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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Batas Anggaran Bulanan Belum Ditentukan
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
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
  let bgColor = 'bg-emerald-50/70 border-emerald-200 text-emerald-950';
  let progressColor = 'bg-emerald-500';
  let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
  let title = 'Pengeluaran Masih Terkendali Aman';
  let message = `Anda telah menggunakan ${budgetUsagePercent}% dari batas anggaran bulanan (${formatRupiah(
    totalExpense
  )} dari ${formatRupiah(monthlyBudget)}).`;

  if (isOverBudget) {
    bgColor = 'bg-rose-50/90 border-rose-300 text-rose-950';
    progressColor = 'bg-rose-600';
    icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
    title = 'PERINGATAN: Anggaran Bulan Ini Sudah Terlampaui!';
    message = `Pengeluaran Anda telah melebihi batas anggaran sebesar ${formatRupiah(
      Math.abs(remainingBudget)
    )} (${budgetUsagePercent}% terpakai). Harap rem pengeluaran non-esensial!`;
  } else if (isNearBudget) {
    bgColor = 'bg-amber-50/80 border-amber-300 text-amber-950';
    progressColor = 'bg-amber-500';
    icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
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
          className="self-start sm:self-auto px-3 py-1.5 bg-white/80 hover:bg-white text-slate-800 text-xs font-bold rounded-lg border border-slate-200/60 shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          Kelola Batas
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 space-y-1.5">
        <div className="w-full bg-black/10 rounded-full h-2.5 overflow-hidden">
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
