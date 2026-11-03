'use client';

import React from 'react';
import {
  Wallet,
  PlusCircle,
  FileSpreadsheet,
  Settings,
  Calendar,
  Moon,
  Sun,
  LogOut,
  User,
} from 'lucide-react';
import { formatMonthIndonesian } from '@/lib/formatters';
import { User as UserType } from '@/lib/types';

interface HeaderProps {
  currentMonth: string;
  currentUser: UserType | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAddModal: () => void;
  onQuickExport: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function Header({
  currentMonth,
  currentUser,
  darkMode,
  onToggleDarkMode,
  onOpenAddModal,
  onQuickExport,
  onOpenSettings,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors">
      {/* Brand logo for mobile (sidebar handles desktop) */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
              Dompet<span className="text-blue-600 dark:text-blue-400">Ku</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5">
              Personal Expense Tracker
            </p>
          </div>
        </div>

        {/* Current Active Month Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Periode: {formatMonthIndonesian(currentMonth)}</span>
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Quick Excel Export */}
        <button
          onClick={onQuickExport}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all cursor-pointer border border-emerald-200/60 dark:border-emerald-800"
          title="Ekspor ke Excel (.xlsx)"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Ekspor Excel</span>
        </button>

        {/* Quick Add Expense Modal */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-md shadow-blue-200 dark:shadow-none transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Catat Pengeluaran</span>
        </button>

        {/* User Pill & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              title={`Masuk sebagai: ${currentUser.email}`}
              onClick={onOpenSettings}
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <span className="hidden md:inline-block max-w-[100px] truncate">
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
