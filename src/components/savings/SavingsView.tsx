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
} from 'lucide-react';
import { formatRupiah, formatDateIndonesian } from '@/lib/formatters';
import { SavingsGoal, SavingsTransaction } from '@/lib/types';
import { SavingsModal } from './SavingsModal';

interface SavingsViewProps {
  goals: SavingsGoal[];
  transactions: SavingsTransaction[];
  totalSavings: number;
  savingsThisMonth: number;
  userId?: string;
  onRefresh: () => void;
}

export function SavingsView({
  goals,
  transactions,
  totalSavings,
  savingsThisMonth,
  userId,
  onRefresh,
}: SavingsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'transaction' | 'goal'>('transaction');
  const [modalType, setModalType] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'goal' | 'transaction'>('transaction');

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

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const query = `?type=${deleteType}&id=${deleteConfirmId}${userId ? `&userId=${userId}` : ''}`;
      const res = await fetch(`/api/savings${query}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        onRefresh();
      }
    } catch (e) {
      console.error('Gagal menghapus item tabungan:', e);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <PiggyBank className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Tabungan & Target Impian</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola uang yang Anda tabung, pantau impian keuangan, dan capai tujuan masa depan
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenDeposit()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>+ Catat Menabung</span>
          </button>
          <button
            onClick={() => handleOpenWithdraw()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm rounded-xl border border-amber-200 dark:border-amber-800 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Tarik Tabungan</span>
          </button>
          <button
            onClick={handleOpenAddGoal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs sm:text-sm rounded-xl border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>+ Target Impian</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* SECTION 1: Target Impian & Celengan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Pos Target Impian ({goals.length})
            </h3>
          </div>
          <button
            onClick={handleOpenAddGoal}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            + Buat Target Baru
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
            <div className="w-14 h-14 mx-auto mb-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
              <Target className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Belum Ada Target Impian
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Buat pos tabungan khusus seperti Dana Darurat, Beli Gadget Baru, Liburan, atau Tabungan Nikah agar lebih termotivasi menabung!
            </p>
            <button
              onClick={handleOpenAddGoal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + Buat Target Impian Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  {/* Top row */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs font-bold"
                          style={{ backgroundColor: goal.color || '#10B981' }}
                        >
                          <PiggyBank className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {goal.title}
                          </h4>
                          {goal.targetDate && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              Target: {formatDateIndonesian(goal.targetDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setDeleteConfirmId(goal.id);
                          setDeleteType('goal');
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Hapus Target"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Nominal */}
                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">
                          Terkumpul
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-white">
                          {formatRupiah(goal.currentAmount)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">
                          Target
                        </span>
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {formatRupiah(goal.targetAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span
                          className={
                            isFinished
                              ? 'text-emerald-600 flex items-center gap-1'
                              : 'text-slate-600 dark:text-slate-300'
                          }
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
                        <span className="text-slate-500 font-black">{percent}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {isFinished ? '🎉 Selamat impian terwujud' : 'Terus sisihkan uang!'}
                    </span>
                    <button
                      onClick={() => handleOpenDeposit(goal.id)}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
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

      {/* SECTION 2: Riwayat Mutasi Tabungan */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Riwayat Mutasi Tabungan ({transactions.length})
            </h3>
          </div>
          <button
            onClick={() => handleOpenDeposit()}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            + Catat Mutasi Baru
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <PiggyBank className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">Belum ada catatan mutasi tabungan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Klik tombol &ldquo;+ Catat Menabung&rdquo; di atas untuk mencatat uang yang Anda sisihkan
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDateIndonesian(tx.date)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {tx.type === 'deposit' ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3" />
                            Setor
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            Tarik
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">
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
        )}
      </div>

      {/* Modal Tabungan */}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Konfirmasi Hapus
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {deleteType === 'goal'
                    ? 'Target impian ini akan dihapus permanen.'
                    : 'Catatan mutasi tabungan ini akan dihapus.'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
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
