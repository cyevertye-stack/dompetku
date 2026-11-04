'use client';

import React, { useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Clock,
  Check,
} from 'lucide-react';
import {
  BULAN_INDONESIA,
  formatMonthIndonesian,
  getCurrentMonthString,
  getNextMonthString,
  getPreviousMonthString,
  RangeDetails,
} from '@/lib/formatters';
import { DashboardRange, ThemeMode } from '@/lib/types';
import { CustomDropdown, DropdownOption } from '../ui/CustomDropdown';

interface DashboardPeriodControlProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
  rangeDetails: RangeDetails;
  availableYears?: number[];
  theme?: ThemeMode;
}

const RANGE_OPTIONS: { id: DashboardRange; label: string; desc: string }[] = [
  { id: '1m', label: '1 Bulan', desc: 'Bulan dipilih' },
  { id: '3m', label: '3 Bulan', desc: '3 Bulan terakhir' },
  { id: '6m', label: '6 Bulan', desc: '6 Bulan terakhir' },
  { id: '1y', label: '1 Tahun', desc: '12 Bulan terakhir' },
  { id: 'all', label: 'Semua', desc: 'Semua waktu' },
];

export function DashboardPeriodControl({
  currentMonth,
  onMonthChange,
  range,
  onRangeChange,
  rangeDetails,
  availableYears = [2024, 2025, 2026, 2027, 2028],
  theme = 'light',
}: DashboardPeriodControlProps) {
  const isPink = theme === 'pink';
  const todayMonth = useMemo(() => getCurrentMonthString(), []);
  const prevMonthStr = useMemo(
    () => getPreviousMonthString(currentMonth),
    [currentMonth]
  );
  const nextMonthStr = useMemo(
    () => getNextMonthString(currentMonth),
    [currentMonth]
  );
  const isCurrentMonth = currentMonth === todayMonth;

  // Generate options untuk dropdown pilihan bulan dan tahun
  const monthOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    availableYears.forEach((year) => {
      BULAN_INDONESIA.forEach((name, idx) => {
        const m = String(idx + 1).padStart(2, '0');
        list.push({
          value: `${year}-${m}`,
          label: `${name} ${year}`,
        });
      });
    });
    return list.sort((a, b) => b.value.localeCompare(a.value));
  }, [availableYears]);

  const dropdownOptions: DropdownOption[] = useMemo(() => {
    return monthOptions.map((opt) => ({
      value: opt.value,
      label: opt.label,
      badge: opt.value === todayMonth ? 'Bulan Ini' : undefined,
      icon: <Calendar className={`w-3.5 h-3.5 ${isPink ? 'text-rose-500' : 'text-blue-500'}`} />,
    }));
  }, [monthOptions, todayMonth, isPink]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
      {/* 1. Baris Navigasi Bulan: < [November 2026 ▾] > */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMonthChange(prevMonthStr)}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl transition-all cursor-pointer active:scale-90 shrink-0"
          title={`Bulan Lalu: ${formatMonthIndonesian(prevMonthStr)}`}
        >
          <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Dropdown Bulan & Tahun dengan lebar fleksibel penuh tanpa terpotong */}
        <div className="flex-1 min-w-0">
          <CustomDropdown
            value={currentMonth}
            onChange={onMonthChange}
            options={dropdownOptions}
            size="md"
            searchable={dropdownOptions.length > 8}
            searchPlaceholder="Cari bulan & tahun..."
            icon={<Calendar className={`w-4 h-4 ${isPink ? 'text-rose-500' : 'text-blue-600 dark:text-blue-400'}`} />}
          />
        </div>

        <button
          type="button"
          onClick={() => onMonthChange(nextMonthStr)}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl transition-all cursor-pointer active:scale-90 shrink-0"
          title={`Bulan Depan: ${formatMonthIndonesian(nextMonthStr)}`}
        >
          <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Tombol Kembali ke Bulan Ini jika sedang melihat bulan lain */}
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => onMonthChange(todayMonth)}
            className={`p-2.5 sm:px-3 sm:py-2.5 text-xs font-bold rounded-2xl transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5 ${
              isPink
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
            }`}
            title="Kembali ke Bulan Ini"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bulan Ini</span>
          </button>
        )}
      </div>

      {/* 2. Baris Preset Rentang: 1 Bulan | 3 Bulan | 6 Bulan | 1 Tahun | Semua */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-2xl">
        {RANGE_OPTIONS.map((opt) => {
          const isActive = range === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onRangeChange(opt.id)}
              className={`py-2 px-1 text-center rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? isPink
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 3. Baris Ringkasan Rentang Tanggal Aktif (Minimal & Elegan, 1 baris) */}
      <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 px-1 pt-0.5">
        <span className="font-medium">
          {range === '1m' ? 'Periode aktif:' : `Rentang ${rangeDetails.periodName}:`}
        </span>
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {rangeDetails.label}
        </span>
      </div>
    </div>
  );
}
