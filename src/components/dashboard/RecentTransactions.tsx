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
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Transaksi Pengeluaran Terbaru</h3>
          <p className="text-xs text-slate-400 mt-0.5">5 catatan transaksi terkini</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer pl-1"
          >
            <span>Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {recentTxs.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-medium text-slate-500">Belum ada catatan pengeluaran</p>
          <button
            onClick={onOpenAddModal}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Tambah Pengeluaran Pertama
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {recentTxs.map((tx) => {
            const cat = categoryMap.get(tx.categoryId);
            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon
                    name={cat?.icon || 'Tag'}
                    color={cat?.color || '#3B82F6'}
                    size={18}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span>{cat?.name || 'Lain-lain'}</span>
                      <span>•</span>
                      <span>{formatDateIndonesian(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-rose-600">
                    - {formatRupiah(tx.amount)}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
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
