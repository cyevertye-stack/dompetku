'use client';

import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Target,
  Tag,
  FileSpreadsheet,
  Settings,
  Wallet,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export type TabKey = 'dashboard' | 'transactions' | 'budgets' | 'categories' | 'reports' | 'settings';

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  transactionCount: number;
  isOverBudget: boolean;
}

export function Sidebar({
  activeTab,
  onTabChange,
  transactionCount,
  isOverBudget,
}: SidebarProps) {
  const menuItems = [
    {
      key: 'dashboard' as TabKey,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      key: 'transactions' as TabKey,
      label: 'Transaksi',
      icon: Receipt,
      badge: transactionCount > 0 ? transactionCount : null,
    },
    {
      key: 'budgets' as TabKey,
      label: 'Anggaran & Batas',
      icon: Target,
      badge: isOverBudget ? 'Alert' : null,
    },
    {
      key: 'categories' as TabKey,
      label: 'Kategori',
      icon: Tag,
      badge: null,
    },
    {
      key: 'reports' as TabKey,
      label: 'Laporan & Excel',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      key: 'settings' as TabKey,
      label: 'Pengaturan & Cloud',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-4 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-white leading-none">
            Dompet<span className="text-blue-400">Ku</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
            Expense Tracker
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Menu Utama
        </div>

        {menuItems.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    item.badge === 'Alert'
                      ? 'bg-rose-500 text-white'
                      : isActive
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-[11px] leading-tight">
            <span className="font-bold text-white block">Offline & Online Ready</span>
            <span className="text-slate-400">Penyimpanan Aman</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
