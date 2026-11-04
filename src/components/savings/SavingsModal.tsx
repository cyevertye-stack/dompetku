'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
  Sparkles,
  Calendar,
  Wallet,
  Tag,
  FileText,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';
import { SavingsGoal, SavingsTransaction } from '@/lib/types';
import { CustomDropdown, DropdownOption } from '../ui/CustomDropdown';

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'transaction' | 'goal';
  initialType?: 'deposit' | 'withdraw';
  goals: SavingsGoal[];
  selectedGoalId?: string;
  onSaveTransaction: (tx: Partial<SavingsTransaction>) => Promise<void>;
  onSaveGoal: (goal: Partial<SavingsGoal>) => Promise<void>;
  userId?: string;
}

const PRESET_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#14B8A6', // Teal
];

export function SavingsModal({
  isOpen,
  onClose,
  initialMode = 'transaction',
  initialType = 'deposit',
  goals,
  selectedGoalId,
  onSaveTransaction,
  onSaveGoal,
  userId,
}: SavingsModalProps) {
  const [mode, setMode] = useState<'transaction' | 'goal'>(initialMode);

  // Transaction form state
  const [txType, setTxType] = useState<'deposit' | 'withdraw'>(initialType);
  const [txAmount, setTxAmount] = useState<string>('');
  const [txGoalId, setTxGoalId] = useState<string>(selectedGoalId || '');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [txNotes, setTxNotes] = useState<string>('');

  // Goal form state
  const [goalTitle, setGoalTitle] = useState<string>('');
  const [goalTargetAmount, setGoalTargetAmount] = useState<string>('');
  const [goalCurrentAmount, setGoalCurrentAmount] = useState<string>('');
  const [goalTargetDate, setGoalTargetDate] = useState<string>('');
  const [goalColor, setGoalColor] = useState<string>('#10B981');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setTxType(initialType);
      setTxGoalId(selectedGoalId || '');
      setTxDate(new Date().toISOString().split('T')[0]);
      setTxAmount('');
      setTxNotes('');
      setGoalTitle('');
      setGoalTargetAmount('');
      setGoalCurrentAmount('');
      setGoalTargetDate('');
      setGoalColor('#10B981');
      setError(null);
    }
  }, [isOpen, initialMode, initialType, selectedGoalId]);

  if (!isOpen) return null;

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseInt(txAmount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Masukkan nominal tabungan yang valid');
      return;
    }

    try {
      setIsSubmitting(true);
      const chosenGoal = goals.find((g) => g.id === txGoalId);
      await onSaveTransaction({
        userId,
        goalId: txGoalId || undefined,
        goalTitle: chosenGoal ? chosenGoal.title : undefined,
        type: txType,
        amount: amountNum,
        date: txDate,
        notes: txNotes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi tabungan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!goalTitle.trim()) {
      setError('Nama target tabungan tidak boleh kosong');
      return;
    }

    const targetNum = parseInt(goalTargetAmount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(targetNum) || targetNum <= 0) {
      setError('Masukkan target nominal tabungan yang valid');
      return;
    }

    const currentNum = goalCurrentAmount
      ? parseInt(goalCurrentAmount.replace(/[^0-9]/g, ''), 10) || 0
      : 0;

    try {
      setIsSubmitting(true);
      await onSaveGoal({
        userId,
        title: goalTitle.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        targetDate: goalTargetDate || undefined,
        color: goalColor,
        icon: 'PiggyBank',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat target tabungan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {mode === 'transaction' ? 'Catat Uang Tabungan' : 'Target Impian Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'transaction'
                  ? 'Setor atau tarik uang simpanan Anda'
                  : 'Rencanakan impian dan pos dana masa depan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-2 bg-slate-50/30 dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => setMode('transaction')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'transaction'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Setor / Tarik Tabungan</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('goal')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'goal'
                ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Target Impian Baru</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {mode === 'transaction' ? (
            <form id="savings-tx-form" onSubmit={handleTransactionSubmit} className="space-y-4">
              {/* Type Switcher: Setor vs Tarik */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('deposit')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    txType === 'deposit'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Setor Tabungan (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('withdraw')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    txType === 'withdraw'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Tarik Tabungan (-)</span>
                </button>
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nominal {txType === 'deposit' ? 'Uang Ditabung' : 'Uang Ditarik'} (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="0"
                    value={txAmount ? Number(txAmount).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setTxAmount(raw);
                    }}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Goal Allocation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tujuan / Pos Tabungan
                </label>
                <CustomDropdown
                  value={txGoalId}
                  onChange={setTxGoalId}
                  options={[
                    {
                      value: '',
                      label: 'Tabungan Bebas / Umum (Tanpa Target Khusus)',
                      icon: <PiggyBank className="w-4 h-4 text-emerald-500" />,
                    },
                    ...goals.map((g) => ({
                      value: g.id,
                      label: g.title,
                      badge: `Target: ${formatRupiah(g.targetAmount)}`,
                      icon: <Target className="w-4 h-4 text-blue-500" />,
                    })),
                  ]}
                  size="md"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tanggal Transaksi *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Sisa gaji bulan ini, bonus lembur, dll."
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </form>
          ) : (
            <form id="savings-goal-form" onSubmit={handleGoalSubmit} className="space-y-4">
              {/* Nama Target */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Target Impian *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dana Darurat, Beli Laptop, Liburan Jepang"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Target Nominal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Nominal yang Ingin Dikumpulkan (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 10.000.000"
                    value={goalTargetAmount ? Number(goalTargetAmount).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setGoalTargetAmount(raw);
                    }}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Saldo Saat Ini (Opsional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Saldo Awal yang Sudah Ada (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    placeholder="0"
                    value={goalCurrentAmount ? Number(goalCurrentAmount).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setGoalCurrentAmount(raw);
                    }}
                    className="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Target Tanggal (Opsional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Batas Target Tanggal (Opsional)
                </label>
                <input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Warna Kartu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Warna Tema Target
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGoalColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        goalColor === c ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form={mode === 'transaction' ? 'savings-tx-form' : 'savings-goal-form'}
            disabled={isSubmitting}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer ${
              mode === 'transaction'
                ? txType === 'deposit'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            } disabled:opacity-60`}
          >
            {isSubmitting
              ? 'Menyimpan...'
              : mode === 'transaction'
              ? txType === 'deposit'
                ? 'Simpan Setoran Tabungan'
                : 'Simpan Penarikan Tabungan'
              : 'Buat Target Impian'}
          </button>
        </div>
      </div>
    </div>
  );
}
