'use client';

import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Target,
  FileSpreadsheet,
} from 'lucide-react';
import { TabKey } from './Sidebar';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenAddModal: () => void;
}

export function BottomNav({
  activeTab,
  onTabChange,
  onOpenAddModal,
}: BottomNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg select-none">
      <div className="flex items-center justify-around relative">
        {/* 1. Dashboard */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Beranda</span>
        </button>

        {/* 2. Transactions */}
        <button
          onClick={() => onTabChange('transactions')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Transaksi</span>
        </button>

        {/* 3. Center FAB: Quick Add Button */}
        <div className="relative -top-5">
          <button
            onClick={onOpenAddModal}
            className="w-13 h-13 bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-500 hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-white transition-all cursor-pointer"
            title="Catat Pengeluaran Baru"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Budgets */}
        <button
          onClick={() => onTabChange('budgets')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'budgets'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Anggaran</span>
        </button>

        {/* 5. Reports & Excel */}
        <button
          onClick={() => onTabChange('reports')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Laporan</span>
        </button>
      </div>
    </div>
  );
}
