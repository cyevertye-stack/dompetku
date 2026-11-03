'use client';

import React, { useState } from 'react';
import { Search, Filter, RotateCcw, Calendar, ArrowUpDown, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    (filter.categoryId && filter.categoryId !== 'all') ||
    (filter.paymentMethod && filter.paymentMethod !== 'all') ||
    (filter.month && filter.month !== 'all') ||
    filter.startDate ||
    filter.endDate ||
    (filter.type && filter.type !== 'all');

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
      {/* Segmented Filter: Semua | Pengeluaran | Pemasukan (Teks Ringkas & Pas di Layar HP) */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => onChange({ ...filter, type: 'all' })}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center active:scale-95 ${
            !filter.type || filter.type === 'all'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Semua
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...filter, type: 'expense' })}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center active:scale-95 ${
            filter.type === 'expense'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...filter, type: 'income' })}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center active:scale-95 ${
            filter.type === 'income'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Pemasukan
        </button>
      </div>

      {/* Top Search bar & sort filter */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
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
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Sort & Toggle Filter Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              value={filter.sortBy || 'date-desc'}
              onChange={(e) =>
                onChange({ ...filter, sortBy: e.target.value as FilterType['sortBy'] })
              }
              className="w-full pl-9 pr-7 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="date-desc">Terbaru</option>
              <option value="date-asc">Terlama</option>
              <option value="amount-desc">Nominal Terbesar</option>
              <option value="amount-asc">Nominal Terkecil</option>
            </select>
          </div>

          {/* Toggle filter dropdown button on mobile */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`sm:hidden p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showAdvanced || hasActiveFilters
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title="Filter Lanjutan"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Filter Row: Kategori, Metode, Bulan, Rentang Tanggal */}
      <div className={`${showAdvanced ? 'grid' : 'hidden sm:grid'} grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800`}>
        {/* Category */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Kategori
          </label>
          <select
            value={filter.categoryId || 'all'}
            onChange={(e) => onChange({ ...filter, categoryId: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
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
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Metode Pembayaran
          </label>
          <select
            value={filter.paymentMethod || 'all'}
            onChange={(e) => onChange({ ...filter, paymentMethod: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="all">Semua Metode</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Bulan
          </label>
          <input
            type="month"
            value={filter.month === 'all' ? '' : filter.month || ''}
            onChange={(e) => onChange({ ...filter, month: e.target.value || 'all' })}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          />
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
