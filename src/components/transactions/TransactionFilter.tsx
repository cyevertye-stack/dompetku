'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Calendar,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
} from 'lucide-react';
import { Category, PaymentMethod, TransactionFilter as FilterType } from '@/lib/types';
import {
  BULAN_INDONESIA,
  getCurrentMonthString,
  getPreviousMonthString,
  formatMonthIndonesian,
} from '@/lib/formatters';

interface TransactionFilterProps {
  filter: FilterType;
  onChange: (updated: FilterType) => void;
  onReset: () => void;
  categories: Category[];
  availableYears?: number[];
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
  availableYears = [2024, 2025, 2026, 2027, 2028],
}: TransactionFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Bulan dan Tahun saat ini
  const currentMonthStr = useMemo(() => getCurrentMonthString(), []);
  const prevMonthStr = useMemo(() => getPreviousMonthString(currentMonthStr), [currentMonthStr]);
  const currentYearStr = useMemo(() => currentMonthStr.split('-')[0] || '2026', [currentMonthStr]);

  // Parsing selectedMonth & selectedYear dari filter.month
  // Format bisa: 'all', 'YYYY-MM' (misal: '2026-10'), 'YYYY' (misal: '2026'), atau '-MM' (misal: '-10')
  const { selectedYear, selectedMonth } = useMemo(() => {
    const raw = filter.month;
    if (!raw || raw === 'all') {
      return { selectedYear: 'all', selectedMonth: 'all' };
    }
    if (raw.startsWith('-')) {
      return { selectedYear: 'all', selectedMonth: raw.substring(1) };
    }
    if (raw.length === 4) {
      return { selectedYear: raw, selectedMonth: 'all' };
    }
    const parts = raw.split('-');
    if (parts.length >= 2) {
      return { selectedYear: parts[0], selectedMonth: parts[1] };
    }
    return { selectedYear: 'all', selectedMonth: 'all' };
  }, [filter.month]);

  // Handler dropdown Bulan
  const handleMonthChange = (newMonth: string) => {
    let combined = '';
    if (selectedYear === 'all' && newMonth === 'all') {
      combined = 'all';
    } else if (selectedYear === 'all' && newMonth !== 'all') {
      combined = `-${newMonth}`;
    } else if (selectedYear !== 'all' && newMonth === 'all') {
      combined = selectedYear;
    } else {
      combined = `${selectedYear}-${newMonth}`;
    }
    onChange({ ...filter, month: combined });
  };

  // Handler dropdown Tahun
  const handleYearChange = (newYear: string) => {
    let combined = '';
    if (newYear === 'all' && selectedMonth === 'all') {
      combined = 'all';
    } else if (newYear === 'all' && selectedMonth !== 'all') {
      combined = `-${selectedMonth}`;
    } else if (newYear !== 'all' && selectedMonth === 'all') {
      combined = newYear;
    } else {
      combined = `${newYear}-${selectedMonth}`;
    }
    onChange({ ...filter, month: combined });
  };

  // Status Filter Aktif
  const hasActiveFilters =
    (filter.categoryId && filter.categoryId !== 'all') ||
    (filter.paymentMethod && filter.paymentMethod !== 'all') ||
    (filter.month && filter.month !== 'all') ||
    filter.startDate ||
    filter.endDate ||
    (filter.type && filter.type !== 'all') ||
    Boolean(filter.search && filter.search.trim() !== '');

  // Cek preset yang aktif
  const isPresetAll = !filter.month || filter.month === 'all';
  const isPresetThisMonth = filter.month === currentMonthStr;
  const isPresetLastMonth = filter.month === prevMonthStr;
  const isPresetThisYear = filter.month === currentYearStr;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
      {/* 1. Quick Presets Bar: Semua Waktu | Bulan Ini | Bulan Lalu | Tahun Ini */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Filter Waktu:
        </span>
        <button
          type="button"
          onClick={() => onChange({ ...filter, month: 'all', startDate: undefined, endDate: undefined })}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5 ${
            isPresetAll
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Semua Waktu</span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...filter, month: currentMonthStr, startDate: undefined, endDate: undefined })}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5 ${
            isPresetThisMonth
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Bulan Ini ({formatMonthIndonesian(currentMonthStr)})</span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...filter, month: prevMonthStr, startDate: undefined, endDate: undefined })}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5 ${
            isPresetLastMonth
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>Bulan Lalu ({formatMonthIndonesian(prevMonthStr)})</span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...filter, month: currentYearStr, startDate: undefined, endDate: undefined })}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5 ${
            isPresetThisYear
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>Tahun {currentYearStr}</span>
        </button>
      </div>

      {/* 2. Segmented Filter: Semua | Pengeluaran | Pemasukan */}
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
          Semua Tipe
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
          Pengeluaran Saja
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
          Pemasukan Saja
        </button>
      </div>

      {/* 3. Top Search bar & sort filter */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filter.search || ''}
            onChange={(e) => onChange({ ...filter, search: e.target.value })}
            placeholder="Cari transaksi berdasarkan nama atau catatan..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400"
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
              <option value="date-desc">Urutkan: Tanggal Terbaru</option>
              <option value="date-asc">Urutkan: Tanggal Terlama</option>
              <option value="amount-desc">Urutkan: Nominal Terbesar</option>
              <option value="amount-asc">Urutkan: Nominal Terkecil</option>
            </select>
          </div>

          {/* Toggle filter dropdown button on mobile */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`sm:hidden p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-90 ${
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

      {/* 4. Filter Grid: Kategori, Metode, Pilih Bulan, Pilih Tahun */}
      <div className={`${showAdvanced ? 'grid' : 'hidden sm:grid'} grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800`}>
        {/* Dropdown 1: Kategori */}
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

        {/* Dropdown 2: Metode Pembayaran */}
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

        {/* Dropdown 3: Pilih Bulan Kapan */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Pilih Bulan
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="all">Semua Bulan</option>
            {BULAN_INDONESIA.map((name, idx) => {
              const mStr = String(idx + 1).padStart(2, '0');
              return (
                <option key={mStr} value={mStr}>
                  {mStr} - {name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Dropdown 4: Pilih Tahun Kapan */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Pilih Tahun
          </label>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="all">Semua Tahun</option>
            {availableYears.map((yr) => (
              <option key={yr} value={String(yr)}>
                Tahun {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            title="Reset Seluruh Filter"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
