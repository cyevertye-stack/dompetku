'use client';

import React from 'react';
import { ArrowRight, PlusCircle, Calendar, CreditCard } from 'lucide-react';
import { Category, Transaction } from '@/lib/types';
import { formatDateIndonesian, formatRupiah } from '@/lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenAddModal: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onViewAll: () => void;
}

export function RecentTransactions({
  transactions,
  categories,
  onOpenAddModal,
  onSelectTransaction,
  onViewAll,
}: RecentTransactionsProps) {
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Transaksi Terbaru</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">5 catatan pengeluaran & pemasukan terkini</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer pl-1"
          >
            <span>Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {recentTxs.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Belum ada catatan transaksi</p>
          <button
            onClick={onOpenAddModal}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Tambah Transaksi Pertama
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentTxs.map((tx) => {
            const cat = categoryMap.get(tx.categoryId);
            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 p-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon
                    name={cat?.icon || 'Tag'}
                    color={cat?.color || '#3B82F6'}
                    size={18}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      <span>{cat?.name || 'Lain-lain'}</span>
                      <span>•</span>
                      <span>{formatDateIndonesian(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-bold ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                    {tx.paymentMethod}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
