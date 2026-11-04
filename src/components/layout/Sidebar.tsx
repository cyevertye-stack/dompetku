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
  Moon,
  Sun,
  Flower2,
  LogOut,
  PiggyBank,
} from 'lucide-react';
import { ThemeMode, User } from '@/lib/types';

export type TabKey = 'dashboard' | 'transactions' | 'budgets' | 'categories' | 'savings' | 'reports' | 'settings';

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  transactionCount: number;
  isOverBudget: boolean;
  currentUser: User | null;
  darkMode: boolean;
  theme?: ThemeMode;
  onToggleDarkMode?: () => void;
  onToggleTheme?: () => void;
  onLogout: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  transactionCount,
  isOverBudget,
  currentUser,
  darkMode,
  theme = 'light',
  onToggleDarkMode,
  onToggleTheme,
  onLogout,
}: SidebarProps) {
  const handleToggle = onToggleTheme || onToggleDarkMode;

  const getThemeTitle = () => {
    if (theme === 'light') return 'Tema: Terang ☀️ (Klik untuk Mode Gelap)';
    if (theme === 'dark') return 'Tema: Gelap 🌙 (Klik untuk Mode Soft Pink)';
    return 'Tema: Soft Pink 🌸 (Klik untuk Mode Terang)';
  };
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
      key: 'savings' as TabKey,
      label: 'Uang Tabungan',
      icon: PiggyBank,
      badge: null,
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
      label: 'Profil & Pengaturan',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <img
            src="/icon-192.png"
            alt="DompetKu"
            className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20 object-cover border border-slate-700/60"
          />
          <div>
            <h2 className="text-lg font-black tracking-tight text-white leading-none">
              Dompet<span className="text-blue-400">Ku</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
              Personal Finance
            </p>
          </div>
        </div>

        {/* Theme Toggle Button (3 Modes: Light, Dark, Soft Pink) */}
        <button
          onClick={handleToggle}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
          title={getThemeTitle()}
        >
          {theme === 'pink' ? (
            <Flower2 className="w-4 h-4 text-rose-400 animate-in zoom-in-75 duration-200" />
          ) : theme === 'dark' || (darkMode && !theme) ? (
            <Moon className="w-4 h-4 text-indigo-300 animate-in zoom-in-75 duration-200" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 animate-in zoom-in-75 duration-200" />
          )}
        </button>
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
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 hover:translate-x-1'
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

      {/* User info & Logout */}
      {currentUser && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase shrink-0">
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {currentUser.name || 'Pengguna'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {currentUser.email}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
