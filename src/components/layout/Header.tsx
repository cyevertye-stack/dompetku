'use client';

import React, { useMemo } from 'react';
import {
  Wallet,
  PlusCircle,
  FileSpreadsheet,
  Settings,
  Calendar,
  Moon,
  Sun,
  Flower2,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  formatMonthIndonesian,
  getCurrentMonthString,
  getPreviousMonthString,
  getNextMonthString,
  BULAN_INDONESIA,
} from '@/lib/formatters';
import { ThemeMode, User as UserType } from '@/lib/types';
import { CustomDropdown, DropdownOption } from '../ui/CustomDropdown';

interface HeaderProps {
  currentMonth: string;
  currentUser: UserType | null;
  darkMode: boolean;
  theme?: ThemeMode;
  activeTab?: string;
  onToggleDarkMode?: () => void;
  onToggleTheme?: () => void;
  onOpenAddModal: () => void;
  onQuickExport: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onMonthChange?: (month: string) => void;
  availableYears?: number[];
}

export function Header({
  currentMonth,
  currentUser,
  darkMode,
  theme = 'light',
  activeTab = 'dashboard',
  onToggleDarkMode,
  onToggleTheme,
  onOpenAddModal,
  onQuickExport,
  onOpenSettings,
  onLogout,
  onMonthChange,
  availableYears = [2024, 2025, 2026, 2027, 2028],
}: HeaderProps) {
  const handleToggle = onToggleTheme || onToggleDarkMode;

  const todayMonth = useMemo(() => getCurrentMonthString(), []);
  const prevMonthStr = useMemo(() => getPreviousMonthString(currentMonth), [currentMonth]);
  const nextMonthStr = useMemo(() => getNextMonthString(currentMonth), [currentMonth]);
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
    // Urutkan dari yang terbaru ke terlama
    return list.sort((a, b) => b.value.localeCompare(a.value));
  }, [availableYears]);

  const dropdownOptions: DropdownOption[] = useMemo(() => {
    return monthOptions.map((opt) => ({
      value: opt.value,
      label: opt.label,
      badge: opt.value === todayMonth ? 'Bulan Ini' : undefined,
      icon: <Calendar className="w-3.5 h-3.5 text-blue-500" />,
    }));
  }, [monthOptions, todayMonth]);

  const getThemeTitle = () => {
    if (theme === 'light') return 'Mode: Terang ☀️ (Klik untuk Mode Gelap)';
    if (theme === 'dark') return 'Mode: Gelap 🌙 (Klik untuk Mode Soft Pink)';
    return 'Mode: Soft Pink 🌸 (Klik untuk Mode Terang)';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3.5 sm:px-8 py-3 flex items-center justify-between gap-3 transition-colors">
      {/* Brand logo for mobile (sidebar handles desktop) */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="lg:hidden flex items-center gap-2">
          <img
            src="/icon-192.png"
            alt="DompetKu"
            className="w-8 h-8 rounded-xl shadow-md shadow-blue-500/20 object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
              Dompet<span className="text-blue-600 dark:text-blue-400">Ku</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-semibold tracking-wide mt-0.5">
              Personal Finance
            </p>
          </div>
        </div>

        {/* Month & Year Navigator (Tablet & Desktop: sm:flex) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            {/* Tombol Bulan Sebelumnya */}
            <button
              type="button"
              onClick={() => onMonthChange && onMonthChange(prevMonthStr)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer active:scale-90"
              title={`Bulan Lalu: ${formatMonthIndonesian(prevMonthStr)}`}
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Custom Modern Dropdown Pilihan Bulan & Tahun */}
            <div className="w-40 sm:w-48">
              <CustomDropdown
                value={currentMonth}
                onChange={(m) => onMonthChange && onMonthChange(m)}
                options={dropdownOptions}
                size="sm"
                searchable={dropdownOptions.length > 8}
                searchPlaceholder="Cari bulan/tahun..."
                icon={<Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              />
            </div>

            {/* Tombol Bulan Berikutnya */}
            <button
              type="button"
              onClick={() => onMonthChange && onMonthChange(nextMonthStr)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer active:scale-90"
              title={`Bulan Berikutnya: ${formatMonthIndonesian(nextMonthStr)}`}
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Tombol Cepat Kembali ke Bulan Ini jika sedang melihat bulan lampau */}
          {!isCurrentMonth && onMonthChange && (
            <button
              type="button"
              onClick={() => onMonthChange(todayMonth)}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl transition-all hover:bg-blue-100 active:scale-95 cursor-pointer shadow-2xs"
              title="Kembali ke Bulan Berjalan"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Bulan Ini</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* 3-Mode Theme Toggle (Light, Dark, Soft Pink) */}
        <button
          onClick={handleToggle}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
          title={getThemeTitle()}
        >
          {theme === 'pink' ? (
            <Flower2 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 animate-in zoom-in-75 duration-200" />
          ) : theme === 'dark' || (darkMode && !theme) ? (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 animate-in zoom-in-75 duration-200" />
          ) : (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 animate-in zoom-in-75 duration-200" />
          )}
        </button>

        {/* Quick Excel Export */}
        <button
          onClick={onQuickExport}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all cursor-pointer border border-emerald-200/60 dark:border-emerald-800 active:scale-95"
          title="Ekspor ke Excel (.xlsx)"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Ekspor Excel</span>
        </button>

        {/* Quick Add Button */}
        {(activeTab === 'dashboard' || activeTab === 'transactions') && (
          <button
            onClick={onOpenAddModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-md shadow-blue-200 dark:shadow-none transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Transaksi</span>
          </button>
        )}

        {/* User Pill & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={`Profil & Pengaturan Akun (${currentUser.email})`}
              onClick={onOpenSettings}
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase shadow-xs">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <span className="hidden sm:inline-block max-w-[120px] truncate">
                {currentUser.name || currentUser.email}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
