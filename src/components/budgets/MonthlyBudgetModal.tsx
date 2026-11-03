'use client';

import React, { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';
import { formatRupiah, parseRupiahInput } from '@/lib/formatters';

interface MonthlyBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number) => Promise<void>;
  monthLabel: string;
  currentBudget: number;
}

const PRESET_BUDGETS = [1000000, 2000000, 3000000, 5000000, 7500000, 10000000];

export function MonthlyBudgetModal({
  isOpen,
  onClose,
  onSave,
  monthLabel,
  currentBudget,
}: MonthlyBudgetModalProps) {
  const [budgetStr, setBudgetStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (currentBudget > 0) {
      setBudgetStr(currentBudget.toString());
    } else {
      setBudgetStr('');
    }
    setErrorMessage('');
  }, [currentBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const amount = parseRupiahInput(budgetStr);
    if (amount < 0) {
      setErrorMessage('Nominal batas anggaran tidak boleh negatif!');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(amount);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan anggaran bulanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedBudget = parseRupiahInput(budgetStr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Atur Batas Anggaran Bulanan</h3>
              <p className="text-xs text-blue-200 mt-0.5">{monthLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Anggaran Maksimal
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-base">
                Rp
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={
                  budgetStr
                    ? new Intl.NumberFormat('id-ID').format(parseRupiahInput(budgetStr))
                    : ''
                }
                onChange={(e) => setBudgetStr(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Contoh: 3.500.000"
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                required
              />
            </div>
            {parsedBudget > 0 && (
              <p className="mt-1 text-xs text-blue-600 font-medium">
                Terbaca: {formatRupiah(parsedBudget)}
              </p>
            )}
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pilihan Cepat
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_BUDGETS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setBudgetStr(amount.toString())}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    parsedBudget === amount
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {formatRupiah(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Batas Anggaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
