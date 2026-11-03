'use client';

import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Target,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Coins,
  ShieldCheck,
  AlertCircle,
  Award,
  Scale,
  MapPin,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { formatRupiah, formatDateIndonesian } from '@/lib/formatters';
import { GoldSavings, GoldTransaction, SavingsGoal, SavingsTransaction } from '@/lib/types';
import { SavingsModal } from './SavingsModal';
import { GoldModal } from './GoldModal';

interface SavingsViewProps {
  goals: SavingsGoal[];
  transactions: SavingsTransaction[];
  totalSavings: number;
  savingsThisMonth: number;
  goldSavings?: GoldSavings[];
  goldTransactions?: GoldTransaction[];
  totalGoldGrams?: number;
  totalGoldEstimatedValue?: number;
  userId?: string;
  onRefresh: () => void;
}

export function SavingsView({
  goals,
  transactions,
  totalSavings,
  savingsThisMonth,
  goldSavings = [],
  goldTransactions = [],
  totalGoldGrams = 0,
  totalGoldEstimatedValue = 0,
  userId,
  onRefresh,
}: SavingsViewProps) {
  const [subTab, setSubTab] = useState<'money' | 'gold'>('money');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoldModalOpen, setIsGoldModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'transaction' | 'goal'>('transaction');
  const [modalType, setModalType] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'goal' | 'transaction' | 'gold'>('transaction');

  // Completed goals
  const completedGoalsCount = goals.filter(
    (g) => g.targetAmount > 0 && g.currentAmount >= g.targetAmount
  ).length;

  const handleOpenDeposit = (goalId?: string) => {
    setSelectedGoalId(goalId);
    setModalMode('transaction');
    setModalType('deposit');
    setIsModalOpen(true);
  };

  const handleOpenWithdraw = () => {
    setSelectedGoalId(undefined);
    setModalMode('transaction');
    setModalType('withdraw');
    setIsModalOpen(true);
  };

  const handleOpenAddGoal = () => {
    setSelectedGoalId(undefined);
    setModalMode('goal');
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (txData: Partial<SavingsTransaction>) => {
    const res = await fetch('/api/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'transaction',
        transaction: txData,
        userId,
      }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    onRefresh();
  };

  const handleSaveGoal = async (goalData: Partial<SavingsGoal>) => {
    const res = await fetch('/api/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'goal',
        goal: goalData,
        userId,
      }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    onRefresh();
  };

  const handleSaveGold = async (goldData: Partial<GoldSavings>) => {
    const res = await fetch('/api/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'gold',
        gold: goldData,
        userId,
      }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    onRefresh();
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      // 1. Bersihkan segera dari cache browser agar tidak muncul kembali
      if (typeof window !== 'undefined') {
        const cacheKey = userId ? `dompetku-cache-${userId}` : 'dompetku-cache-default';
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (deleteType === 'goal') {
              parsed.savingsGoals = (parsed.savingsGoals || []).filter((g: any) => g.id !== deleteConfirmId);
            } else if (deleteType === 'gold') {
              parsed.goldSavings = (parsed.goldSavings || []).filter((g: any) => g.id !== deleteConfirmId);
            } else {
              parsed.savingsTransactions = (parsed.savingsTransactions || []).filter((t: any) => t.id !== deleteConfirmId);
            }
            localStorage.setItem(cacheKey, JSON.stringify(parsed));
          } catch (e) {}
        }
      }

      // 2. Request ke backend API
      const query = `?type=${deleteType}&id=${deleteConfirmId}${userId ? `&userId=${userId}` : ''}`;
      const res = await fetch(`/api/savings${query}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        onRefresh();
      }
    } catch (e) {
      console.error('Gagal menghapus item:', e);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Intro (Versi Mobile Bersih & Rapi) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <PiggyBank className="w-5 h-5 sm:w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Tabungan & Emas</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola uang yang Anda sisihkan dan pantau investasi emas Anda
          </p>
        </div>

        {/* Action Buttons: Responsive & Rapi di Layar HP */}
        {subTab === 'money' ? (
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2">
            <button
              onClick={() => handleOpenDeposit()}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>Nabung</span>
            </button>
            <button
              onClick={() => handleOpenWithdraw()}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm rounded-xl border border-amber-200 dark:border-amber-800 transition-all cursor-pointer active:scale-95"
            >
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Tarik</span>
            </button>
            <button
              onClick={handleOpenAddGoal}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs sm:text-sm rounded-xl border border-blue-200 dark:border-blue-800 transition-all cursor-pointer active:scale-95"
            >
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Target</span>
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setIsGoldModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>+ Beli / Simpan Emas</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub-Tab Navigation Toggle (Pill Switcher Rapi & Modern) */}
      <div className="flex bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl sm:rounded-2xl gap-1">
        <button
          onClick={() => setSubTab('money')}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
            subTab === 'money'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Tabungan Uang</span>
          <span className="hidden sm:inline-block text-[11px] font-semibold opacity-80">
            ({formatRupiah(totalSavings)})
          </span>
        </button>

        <button
          onClick={() => setSubTab('gold')}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
            subTab === 'gold'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Tabungan Emas</span>
          <span className="hidden sm:inline-block text-[11px] font-semibold opacity-80">
            ({totalGoldGrams} gr)
          </span>
          {goldSavings.length > 0 && (
            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
              {goldSavings.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: TABUNGAN UANG & TARGET IMPIAN                                 */}
      {/* ========================================================================= */}
      {subTab === 'money' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Versi Mobile: Satu Kartu Ringkasan (Hero Card) Elegan & Tidak Rame */}
          <div className="block sm:hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md shadow-emerald-700/20">
            <div className="flex items-center justify-between text-xs text-emerald-100 font-semibold mb-1">
              <span>Total Uang yang Ditabung</span>
              <div className="flex items-center gap-1 text-[11px] bg-white/15 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-200" />
                <span>Simpanan Aman</span>
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight mb-3">
              {formatRupiah(totalSavings)}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/15 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                  Bulan Ini
                </span>
                <span className="font-extrabold text-sm text-white">
                  +{formatRupiah(savingsThisMonth)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                  Target Impian
                </span>
                <span className="font-extrabold text-sm text-white">
                  {completedGoalsCount} / {goals.length} Tercapai
                </span>
              </div>
            </div>
          </div>

          {/* Versi Desktop: 3 Kolom Kartu Stat */}
          <div className="hidden sm:grid grid-cols-3 gap-4">
            {/* 1. Total Saldo Tabungan */}
            <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-lg shadow-emerald-600/20 overflow-hidden">
              <div className="absolute right-3 top-3 opacity-15">
                <PiggyBank className="w-24 h-24" />
              </div>
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
                Total Uang yang Ditabung
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                {formatRupiah(totalSavings)}
              </div>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-100">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Simpanan aman terkumpul</span>
              </div>
            </div>

            {/* 2. Ditabung Bulan Ini */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ditabung Bulan Ini
                </span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                +{formatRupiah(savingsThisMonth)}
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Disisihkan dari pendapatan bulan berjalan
              </p>
            </div>

            {/* 3. Target Impian Tercapai */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Target Impian
                </span>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {completedGoalsCount} / {goals.length}
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {goals.length === 0
                  ? 'Belum ada target impian'
                  : `${completedGoalsCount} target berhasil dicapai 100%!`}
              </p>
            </div>
          </div>

          {/* Pos Target Impian */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                  Pos Target Impian ({goals.length})
                </h3>
              </div>
              <button
                onClick={handleOpenAddGoal}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                + Buat Target
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="p-6 sm:p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Belum Ada Target Impian
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-3.5">
                  Buat pos tabungan khusus seperti Dana Darurat, Beli Gadget Baru, Liburan, atau Tabungan Nikah!
                </p>
                <button
                  onClick={handleOpenAddGoal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  + Buat Target Impian Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {goals.map((goal) => {
                  const percent = Math.min(
                    100,
                    goal.targetAmount > 0
                      ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                      : 0
                  );
                  const isFinished = percent >= 100;
                  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                  return (
                    <div
                      key={goal.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-xs font-bold shrink-0"
                              style={{ backgroundColor: goal.color || '#10B981' }}
                            >
                              <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="truncate">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                {goal.title}
                              </h4>
                              {goal.targetDate && (
                                <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3 h-3 shrink-0" />
                                  Target: {formatDateIndonesian(goal.targetDate)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Tombol Hapus: Selalu terlihat di HP (Mobile) dan muncul saat hover di Desktop */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirmId(goal.id);
                              setDeleteType('goal');
                            }}
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 active:bg-rose-50 dark:active:bg-rose-950/40 rounded-xl transition-all cursor-pointer shrink-0"
                            title="Hapus Target"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500 sm:text-slate-400 hover:text-rose-600" />
                          </button>
                        </div>

                        {/* Nominal */}
                        <div className="mt-3.5 flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase">
                              Terkumpul
                            </span>
                            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                              {formatRupiah(goal.currentAmount)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase">
                              Target
                            </span>
                            <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              {formatRupiah(goal.targetAmount)}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span
                              className={`text-[11px] ${
                                isFinished
                                  ? 'text-emerald-600 flex items-center gap-1'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {isFinished ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Tercapai 100%!
                                </>
                              ) : (
                                `Sisa ${formatRupiah(remaining)}`
                              )}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300 font-black text-xs">
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: goal.color || '#10B981',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Quick Action */}
                      <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] text-slate-400">
                          {isFinished ? '🎉 Target Tercapai!' : 'Sisihkan uang'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenDeposit(goal.id)}
                          className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Setor</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Riwayat Mutasi Tabungan */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                  Riwayat Mutasi Tabungan ({transactions.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleOpenDeposit()}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                + Catat Mutasi
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <PiggyBank className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">Belum ada catatan mutasi tabungan</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik tombol &ldquo;Nabung&rdquo; di atas untuk mencatat uang yang Anda sisihkan
                </p>
              </div>
            ) : (
              <>
                {/* 1. VERSI MOBILE (CARD LIST BERSIH & RAPI, TIDAK TUMPANG TINDIH) */}
                <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="py-3 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'deposit'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {tx.type === 'deposit' ? (
                            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                            {tx.goalTitle || 'Tabungan Bebas'}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span>{formatDateIndonesian(tx.date)}</span>
                            {tx.notes && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[120px]">{tx.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-xs font-black ${
                            tx.type === 'deposit'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {tx.type === 'deposit' ? '+' : '-'}
                          {formatRupiah(tx.amount)}
                        </span>
                        {/* Tombol Hapus: Langsung terlihat dan mudah disentuh di HP */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmId(tx.id);
                            setDeleteType('transaction');
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 active:bg-rose-100 dark:active:bg-rose-950/50 rounded-lg cursor-pointer"
                          title="Hapus Catatan Mutasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. VERSI DESKTOP (TABEL LENGKAP) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                        <th className="pb-3 px-3">Tanggal</th>
                        <th className="pb-3 px-3">Tipe</th>
                        <th className="pb-3 px-3">Tujuan / Pos</th>
                        <th className="pb-3 px-3 text-right">Nominal</th>
                        <th className="pb-3 px-3">Catatan</th>
                        <th className="pb-3 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {formatDateIndonesian(tx.date)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                tx.type === 'deposit'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {tx.type === 'deposit' ? (
                                <>
                                  <ArrowDownLeft className="w-3 h-3" /> Setor
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="w-3 h-3" /> Tarik
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {tx.goalTitle || 'Tabungan Bebas / Umum'}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-black text-sm whitespace-nowrap ${
                              tx.type === 'deposit'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {tx.type === 'deposit' ? '+' : '-'}
                            {formatRupiah(tx.amount)}
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                            {tx.notes || '-'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmId(tx.id);
                                setDeleteType('transaction');
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Hapus Mutasi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: TABUNGAN EMAS & LOGAM MULIA                                    */}
      {/* ========================================================================= */}
      {subTab === 'gold' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Versi Mobile: Satu Kartu Ringkasan Emas Elegan & Mewah */}
          <div className="block sm:hidden bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white rounded-2xl p-4 shadow-md shadow-amber-600/20">
            <div className="flex items-center justify-between text-xs text-amber-100 font-semibold mb-1">
              <span>Total Simpanan Emas</span>
              <div className="flex items-center gap-1 text-[11px] bg-white/15 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-yellow-200" />
                <span>{goldSavings.length} Keping / Item</span>
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight mb-3 flex items-baseline gap-1.5">
              <span>{totalGoldGrams}</span>
              <span className="text-sm font-bold text-amber-100">Gram</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/15 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-200 block">
                  Total Modal Pembelian
                </span>
                <span className="font-extrabold text-sm text-white">
                  {formatRupiah(totalGoldEstimatedValue)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-amber-200 block">
                  Status Portofolio
                </span>
                <span className="font-extrabold text-sm text-white flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  Safe Haven
                </span>
              </div>
            </div>
          </div>

          {/* Versi Desktop: 3 Kolom Kartu Stat Emas */}
          <div className="hidden sm:grid grid-cols-3 gap-4">
            {/* 1. Total Berat Emas */}
            <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white rounded-2xl p-5 shadow-lg shadow-amber-500/20 overflow-hidden">
              <div className="absolute right-3 top-3 opacity-20">
                <Award className="w-24 h-24" />
              </div>
              <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                Total Simpanan Emas
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight flex items-baseline gap-2">
                <span>{totalGoldGrams}</span>
                <span className="text-lg font-bold text-amber-100">Gram</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-amber-100">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{goldSavings.length} Keping / Item Logam Mulia</span>
              </div>
            </div>

            {/* 2. Total Modal Pembelian */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Modal Pembelian
                </span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatRupiah(totalGoldEstimatedValue)}
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {totalGoldGrams > 0
                  ? `Rata-rata: ${formatRupiah(Math.round(totalGoldEstimatedValue / totalGoldGrams))} / gr`
                  : 'Belum ada pembelian emas'}
              </p>
            </div>

            {/* 3. Lindung Nilai & Aset Nyata */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status Portofolio
                </span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                Safe Haven
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Lindung nilai terhadap inflasi jangka panjang
              </p>
            </div>
          </div>

          {/* Gold Holdings Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                  Koleksi & Rincian Emas ({goldSavings.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGoldModalOpen(true)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                + Beli / Simpan Emas
              </button>
            </div>

            {goldSavings.length === 0 ? (
              <div className="p-6 sm:p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-amber-300 dark:border-amber-900/60 rounded-2xl">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Belum Ada Tabungan Emas
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-3.5">
                  Mulai catat tabungan emas Anda baik batangan Logam Mulia (Antam, UBS), emas digital, maupun perhiasan emas!
                </p>
                <button
                  type="button"
                  onClick={() => setIsGoldModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  + Catat Tabungan Emas Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {goldSavings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
                  >
                    <div>
                      {/* Top tags & Tombol Hapus */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-amber-500 text-white rounded-lg font-black text-[11px] shadow-xs">
                            {item.karat}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-lg font-bold text-[11px] border border-amber-200 dark:border-amber-800">
                            {item.type === 'Perhiasan' && item.jewelryType
                              ? `${item.jewelryType === 'Cincin' ? '💍' : item.jewelryType === 'Kalung' ? '📿' : item.jewelryType === 'Gelang' ? '🪙' : item.jewelryType === 'Anting' ? '✨' : item.jewelryType === 'Liontin' ? '💎' : '👑'} ${item.jewelryType}`
                              : item.type}
                          </span>
                        </div>

                        {/* Tombol Hapus Emas: Terlihat jelas di HP dan desktop */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmId(item.id);
                            setDeleteType('gold');
                          }}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 active:bg-rose-50 dark:active:bg-rose-950/40 rounded-xl transition-all cursor-pointer shrink-0"
                          title="Hapus Emas"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500 sm:text-slate-400 hover:text-rose-600" />
                        </button>
                      </div>

                      {/* Nama Perhiasan / Model jika ada */}
                      {item.itemName && (
                        <div className="mt-2.5">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                            {item.itemName}
                          </h4>
                          {item.storeName && (
                            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold block mt-0.5">
                              🏪 {item.storeName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Gramasi Utama */}
                      <div className="mt-3.5 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase">
                            Berat
                          </span>
                          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                            <span>{item.weightGrams}</span>
                            <span className="text-xs font-bold text-slate-500">Gram</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase">
                            Harga Beli
                          </span>
                          <div className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                            {formatRupiah(item.purchasePrice)}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            @{formatRupiah(item.pricePerGram)}/gr
                          </span>
                        </div>
                      </div>

                      {/* Details: Lokasi & Seri (Tampilan Rapi & Ringkas) */}
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] sm:text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Tanggal:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                            {formatDateIndonesian(item.purchaseDate)}
                          </span>
                        </div>
                        {item.storageLocation && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] sm:text-[11px]">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              Simpan di:
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                              {item.storageLocation}
                            </span>
                          </div>
                        )}
                        {item.serialNumber && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] sm:text-[11px]">
                              <BadgeCheck className="w-3 h-3 text-amber-500" />
                              No. Seri:
                            </span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                              {item.serialNumber}
                            </span>
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100/60 dark:border-slate-800/60">
                            &ldquo;{item.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tabungan Uang */}
      <SavingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={modalMode}
        initialType={modalType}
        goals={goals}
        selectedGoalId={selectedGoalId}
        onSaveTransaction={handleSaveTransaction}
        onSaveGoal={handleSaveGoal}
        userId={userId}
      />

      {/* Modal Tabungan Emas */}
      <GoldModal
        isOpen={isGoldModalOpen}
        onClose={() => setIsGoldModalOpen(false)}
        onSaveGold={handleSaveGold}
        userId={userId}
      />

      {/* Delete Confirmation Modal (Responsive & Mudah Ditekan di Layar HP) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Konfirmasi Hapus
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {deleteType === 'goal'
                    ? 'Target impian ini akan dihapus permanen.'
                    : deleteType === 'gold'
                    ? 'Data simpanan emas ini akan dihapus dari portofolio Anda.'
                    : 'Catatan mutasi tabungan ini akan dihapus.'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer active:scale-95"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer active:scale-95"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
