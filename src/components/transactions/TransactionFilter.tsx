'use client';

import React from 'react';
import { Search, Filter, RotateCcw, Calendar, ArrowUpDown } from 'lucide-react';
import { Category, PaymentMethod, TransactionFilter as FilterType } from '@/lib/types';
import { BULAN_INDONESIA, getCurrentMonthString } from '@/lib/formatters';

interface TransactionFilterProps {
  filter: FilterType;
  onChange: (updated: FilterType) => void;
  onReset: () => void;
  categories: Category[];
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Tunai',
  'Transfer Bank',
  'E-Wallet (GoPay, OVO, Dana, ShopeePay)',
  'Kartu Debit / Kredit',
  'Lainnya',
];

export function TransactionFilter({
  filter,
  onChange,
  onReset,
  categories,
}: TransactionFilterProps) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
      {/* Top Search bar & quick filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filter.search || ''}
            onChange={(e) => onChange({ ...filter, search: e.target.value })}
            placeholder="Cari transaksi berdasarkan nama atau catatan..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Sort */}
        <div className="relative shrink-0 sm:w-56">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <ArrowUpDown className="w-4 h-4" />
          </div>
          <select
            value={filter.sortBy || 'date-desc'}
            onChange={(e) =>
              onChange({ ...filter, sortBy: e.target.value as FilterType['sortBy'] })
            }
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="date-desc">Terbaru</option>
            <option value="date-asc">Terlama</option>
            <option value="amount-desc">Nominal Terbesar</option>
            <option value="amount-asc">Nominal Terkecil</option>
          </select>
        </div>
      </div>

      {/* Filter Row: Category, Payment, Month, Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Kategori
          </label>
          <select
            value={filter.categoryId || 'all'}
            onChange={(e) => onChange({ ...filter, categoryId: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Metode Bayar
          </label>
          <select
            value={filter.paymentMethod || 'all'}
            onChange={(e) => onChange({ ...filter, paymentMethod: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="all">Semua Metode</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Month */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Filter Bulan
          </label>
          <input
            type="month"
            value={filter.month || ''}
            onChange={(e) => onChange({ ...filter, month: e.target.value, startDate: '', endDate: '' })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
          />
        </div>

        {/* Reset */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
