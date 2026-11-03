'use client';

import React from 'react';
import {
  Wallet,
  PlusCircle,
  FileSpreadsheet,
  Settings,
  Calendar,
  Cloud,
} from 'lucide-react';
import { formatMonthIndonesian, getCurrentMonthString } from '@/lib/formatters';

interface HeaderProps {
  currentMonth: string;
  onOpenAddModal: () => void;
  onQuickExport: () => void;
  onOpenSettings: () => void;
}

export function Header({
  currentMonth,
  onOpenAddModal,
  onQuickExport,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Brand logo for mobile (sidebar handles desktop) */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
              Dompet<span className="text-blue-600">Ku</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5">
              Personal Expense Tracker
            </p>
          </div>
        </div>

        {/* Current Active Month Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-xl text-xs font-bold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Periode: {formatMonthIndonesian(currentMonth)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Excel Export */}
        <button
          onClick={onQuickExport}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer border border-emerald-200/60"
          title="Ekspor ke Excel (.xlsx)"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Ekspor Excel</span>
        </button>

        {/* Quick Add Expense Modal */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Catat Pengeluaran</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Pengaturan & Backup"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
