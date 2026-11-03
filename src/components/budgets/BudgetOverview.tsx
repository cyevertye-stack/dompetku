'use client';

import React from 'react';
import { Target, AlertTriangle, AlertCircle, CheckCircle2, PlusCircle, Edit3 } from 'lucide-react';
import { Category, Transaction } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';

interface BudgetOverviewProps {
  monthlyBudget: number;
  transactions: Transaction[];
  categories: Category[];
  currentMonth: string;
  onOpenMonthlyBudgetModal: () => void;
  onEditCategory: (category: Category) => void;
}

export function BudgetOverview({
  monthlyBudget,
  transactions,
  categories,
  currentMonth,
  onOpenMonthlyBudgetModal,
  onEditCategory,
}: BudgetOverviewProps) {
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
  const totalExpense = currentMonthTxs.reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = monthlyBudget > 0 ? monthlyBudget - totalExpense : 0;
  const usagePercent =
    monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Global Monthly Budget Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
              Anggaran Bulanan Keseluruhan
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {monthlyBudget > 0 ? formatRupiah(monthlyBudget) : 'Belum Ditentukan'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {monthlyBudget > 0
                ? `Pengeluaran: ${formatRupiah(totalExpense)} (${usagePercent}% terpakai)`
                : 'Tentukan batas pengeluaran untuk mengendalikan pengeluaran bulanan'}
            </p>
          </div>

          <button
            onClick={onOpenMonthlyBudgetModal}
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-900/50 transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{monthlyBudget > 0 ? 'Ubah Batas Anggaran' : 'Atur Batas Anggaran'}</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        {monthlyBudget > 0 && (
          <div className="mt-6 space-y-2">
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-xs">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  usagePercent > 100
                    ? 'bg-rose-500'
                    : usagePercent >= 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, usagePercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Terpakai: {formatRupiah(totalExpense)}</span>
              <span
                className={`font-bold ${
                  remainingBudget < 0
                    ? 'text-rose-400'
                    : remainingBudget <= monthlyBudget * 0.2
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {remainingBudget >= 0
                  ? `Sisa: ${formatRupiah(remainingBudget)}`
                  : `Overbudget: -${formatRupiah(Math.abs(remainingBudget))}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Category Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Anggaran Per Kategori</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau batas pengeluaran spesifik untuk tiap kelompok kebutuhan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const catTxs = currentMonthTxs.filter((t) => t.categoryId === cat.id);
            const spent = catTxs.reduce((sum, t) => sum + t.amount, 0);
            const limit = cat.budgetLimit || 0;
            const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            const remaining = limit > 0 ? limit - spent : 0;
            const isOver = limit > 0 && spent > limit;
            const isNear = limit > 0 && !isOver && percent >= 80;

            return (
              <div
                key={cat.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon name={cat.icon} color={cat.color} size={20} />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{cat.name}</h4>
                        <span className="text-xs text-slate-400 font-medium">
                          {catTxs.length} transaksi
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onEditCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Ubah Anggaran Kategori"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Spent vs Limit */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Terpakai</span>
                      <span className="text-lg font-black text-slate-900">
                        {formatRupiah(spent)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Batas</span>
                      <span className="text-sm font-bold text-slate-600">
                        {limit > 0 ? formatRupiah(limit) : 'Belum diatur'}
                      </span>
                    </div>
                  </div>

                  {/* Category Progress Bar */}
                  {limit > 0 ? (
                    <div className="mt-3 space-y-1.5">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span
                          className={
                            isOver
                              ? 'text-rose-600'
                              : isNear
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }
                        >
                          {percent}% terpakai
                        </span>
                        <span className="text-slate-400">
                          {remaining >= 0
                            ? `Sisa ${formatRupiah(remaining)}`
                            : `Lebih -${formatRupiah(Math.abs(remaining))}`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-400 italic">
                      Klik ikon edit untuk mengatur batas anggaran
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                {limit > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Status</span>
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Melebihi Batas</span>
                      </span>
                    ) : isNear ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Mendekati Batas</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aman</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
