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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5 transition-colors">
      {/* BARIS 1: Navigasi Bulan & Tahun (Mobile & Desktop Friendly) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tombol Navigasi < [Bulan Tahun] > */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
            {/* Tombol Mundur 1 Bulan */}
            <button
              type="button"
              onClick={() => onMonthChange(prevMonthStr)}
              className="p-2 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer active:scale-90"
              title={`Bulan Lalu: ${formatMonthIndonesian(prevMonthStr)}`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Modern Custom Dropdown Pilihan Bulan & Tahun */}
            <div className="w-44 xs:w-48 sm:w-56">
              <CustomDropdown
                value={currentMonth}
                onChange={onMonthChange}
                options={dropdownOptions}
                size="sm"
                searchable={dropdownOptions.length > 8}
                searchPlaceholder="Cari bulan & tahun..."
                icon={<Calendar className={`w-4 h-4 ${isPink ? 'text-rose-500' : 'text-blue-600 dark:text-blue-400'}`} />}
              />
            </div>

            {/* Tombol Maju 1 Bulan */}
            <button
              type="button"
              onClick={() => onMonthChange(nextMonthStr)}
              className="p-2 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer active:scale-90"
              title={`Bulan Depan: ${formatMonthIndonesian(nextMonthStr)}`}
            >
              <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>

          {/* Tombol Cepat Kembali ke Bulan Ini jika sedang melihat bulan lampau */}
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => onMonthChange(todayMonth)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl transition-all active:scale-95 cursor-pointer shadow-2xs ${
                isPink
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
              }`}
              title="Kembali ke Bulan Ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bulan Ini</span>
            </button>
          )}
        </div>

        {/* Info Label Tanggal / Rentang Aktif */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {rangeDetails.periodName}:
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {rangeDetails.label}
            </span>
          </div>
        </div>
      </div>

      {/* BARIS 2: Pengaturan Rentang Periode (1 Bulan, 3 Bulan, 6 Bulan, 1 Tahun, Semua) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rentang Periode Dashboard</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            Pilih rentang analisis keuangan
          </span>
        </div>

        {/* Segmented Pill Selector (Horizontal scrollable on mobile) */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-slate-100/80 dark:bg-slate-800/70 p-1.5 rounded-2xl">
          {RANGE_OPTIONS.map((opt) => {
            const isActive = range === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onRangeChange(opt.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 sm:px-3 rounded-xl text-center transition-all duration-200 cursor-pointer active:scale-95 ${
                  isActive
                    ? isPink
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
                }`}
                title={opt.desc}
              >
                <span className="text-xs sm:text-sm font-black tracking-tight leading-tight">
                  {opt.label}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-medium leading-none mt-0.5 truncate hidden xs:inline ${
                    isActive ? 'text-white/85' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {opt.id === '1m'
                    ? 'Bulan Ini'
                    : opt.id === '3m'
                    ? '3 Bln'
                    : opt.id === '6m'
                    ? '6 Bln'
                    : opt.id === '1y'
                    ? '1 Thn'
                    : 'Semua'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
