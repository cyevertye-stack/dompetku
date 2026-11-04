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
  CreditCard,
  Banknote,
  Landmark,
  Smartphone,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Tag,
} from 'lucide-react';
import { Category, PaymentMethod, TransactionFilter as FilterType } from '@/lib/types';
import {
  BULAN_INDONESIA,
  getCurrentMonthString,
  getPreviousMonthString,
  formatMonthIndonesian,
} from '@/lib/formatters';
import { CustomDropdown, DropdownOption } from '../ui/CustomDropdown';
import { CategoryIcon } from '../ui/CategoryIcon';

interface TransactionFilterProps {
  filter: FilterType;
  onChange: (updated: FilterType) => void;
  onReset: () => void;
  categories: Category[];
  availableYears?: number[];
}

export function getPaymentMethodIcon(method: string) {
  if (method.includes('Tunai')) return <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
  if (method.includes('Transfer') || method.includes('Bank')) return <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  if (method.includes('E-Wallet') || method.includes('GoPay') || method.includes('OVO')) return <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
  if (method.includes('Kartu') || method.includes('Debit') || method.includes('Kredit')) return <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
  return <Layers className="w-4 h-4 text-slate-500" />;
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

  // Options untuk masing-masing custom dropdown
  const sortOptions: DropdownOption<string>[] = useMemo(
    () => [
      {
        value: 'date-desc',
        label: 'Tanggal Terbaru',
        icon: <Calendar className="w-3.5 h-3.5 text-blue-500" />,
      },
      {
        value: 'date-asc',
        label: 'Tanggal Terlama',
        icon: <Clock className="w-3.5 h-3.5 text-slate-400" />,
      },
      {
        value: 'amount-desc',
        label: 'Nominal Terbesar',
        icon: <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />,
      },
      {
        value: 'amount-asc',
        label: 'Nominal Terkecil',
        icon: <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />,
      },
    ],
    []
  );

  const categoryOptions: DropdownOption<string>[] = useMemo(() => {
    return [
      {
        value: 'all',
        label: 'Semua Kategori',
        icon: <Layers className="w-3.5 h-3.5 text-slate-400" />,
      },
      ...categories.map((c) => ({
        value: c.id,
        label: c.name,
        colorDot: c.color,
        icon: <CategoryIcon name={c.icon} color={c.color} size={15} />,
      })),
    ];
  }, [categories]);

  const paymentOptions: DropdownOption<string>[] = useMemo(() => {
    return [
      {
        value: 'all',
        label: 'Semua Metode',
        icon: <CreditCard className="w-3.5 h-3.5 text-slate-400" />,
      },
      ...PAYMENT_METHODS.map((m) => ({
        value: m,
        label: m,
        icon: getPaymentMethodIcon(m),
      })),
    ];
  }, []);

  const monthFilterOptions: DropdownOption<string>[] = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Bulan' },
      ...BULAN_INDONESIA.map((name, idx) => {
        const mStr = String(idx + 1).padStart(2, '0');
        return {
          value: mStr,
          label: `${mStr} - ${name}`,
        };
      }),
    ];
  }, []);

  const yearFilterOptions: DropdownOption<string>[] = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Tahun' },
      ...availableYears.map((yr) => ({
        value: String(yr),
        label: `Tahun ${yr}`,
      })),
    ];
  }, [availableYears]);

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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-56">
            <CustomDropdown
              value={filter.sortBy || 'date-desc'}
              onChange={(val) =>
                onChange({ ...filter, sortBy: val as FilterType['sortBy'] })
              }
              options={sortOptions}
              size="md"
              icon={<ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />}
            />
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
          <CustomDropdown
            value={filter.categoryId || 'all'}
            onChange={(val) => onChange({ ...filter, categoryId: val })}
            options={categoryOptions}
            size="sm"
            searchable={categoryOptions.length > 6}
            searchPlaceholder="Cari kategori..."
          />
        </div>

        {/* Dropdown 2: Metode Pembayaran */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Metode Pembayaran
          </label>
          <CustomDropdown
            value={filter.paymentMethod || 'all'}
            onChange={(val) => onChange({ ...filter, paymentMethod: val })}
            options={paymentOptions}
            size="sm"
          />
        </div>

        {/* Dropdown 3: Pilih Bulan Kapan */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Pilih Bulan
          </label>
          <CustomDropdown
            value={selectedMonth}
            onChange={handleMonthChange}
            options={monthFilterOptions}
            size="sm"
            searchable={monthFilterOptions.length > 8}
            searchPlaceholder="Cari bulan..."
            icon={<Calendar className="w-3.5 h-3.5 text-blue-500" />}
          />
        </div>

        {/* Dropdown 4: Pilih Tahun Kapan */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Pilih Tahun
          </label>
          <CustomDropdown
            value={selectedYear}
            onChange={handleYearChange}
            options={yearFilterOptions}
            size="sm"
          />
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
