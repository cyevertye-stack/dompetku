'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  FileText,
  Check,
  TrendingDown,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Category, PaymentMethod, Transaction } from '@/lib/types';
import { formatRupiah, getTodayString, parseRupiahInput } from '@/lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  categories: Category[];
  initialData?: Transaction | null;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Tunai',
  'Transfer Bank',
  'E-Wallet (GoPay, OVO, Dana, ShopeePay)',
  'Kartu Debit / Kredit',
  'Lainnya',
];

// Kategori bawaan siap pakai jika pengguna belum menambahkan kategori khusus
const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'cat-income-gaji', name: 'Gaji Bulanan', icon: 'Briefcase', color: '#10B981', budgetLimit: 0 },
  { id: 'cat-income-bonus', name: 'Bonus & THR', icon: 'Gift', color: '#06B6D4', budgetLimit: 0 },
  { id: 'cat-income-usaha', name: 'Bisnis & Usaha', icon: 'TrendingUp', color: '#3B82F6', budgetLimit: 0 },
  { id: 'cat-income-freelance', name: 'Freelance & Proyek', icon: 'Laptop', color: '#8B5CF6', budgetLimit: 0 },
  { id: 'cat-income-investasi', name: 'Investasi & Dividen', icon: 'Coins', color: '#F59E0B', budgetLimit: 0 },
  { id: 'cat-income-hadiah', name: 'Hadiah / Uang Jajan', icon: 'Heart', color: '#EC4899', budgetLimit: 0 },
  { id: 'cat-income-lainnya', name: 'Pemasukan Lainnya', icon: 'PlusCircle', color: '#14B8A6', budgetLimit: 0 },
];

const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'cat-exp-makan', name: 'Makanan & Minuman', icon: 'Utensils', color: '#F97316', budgetLimit: 0 },
  { id: 'cat-exp-transport', name: 'Transportasi', icon: 'Car', color: '#3B82F6', budgetLimit: 0 },
  { id: 'cat-exp-belanja', name: 'Belanja', icon: 'ShoppingBag', color: '#EC4899', budgetLimit: 0 },
  { id: 'cat-exp-tagihan', name: 'Tagihan & Utilitas', icon: 'Receipt', color: '#EF4444', budgetLimit: 0 },
  { id: 'cat-exp-hiburan', name: 'Hiburan', icon: 'Film', color: '#EAB308', budgetLimit: 0 },
  { id: 'cat-exp-kesehatan', name: 'Kesehatan', icon: 'HeartPulse', color: '#10B981', budgetLimit: 0 },
  { id: 'cat-exp-lainnya', name: 'Pengeluaran Lainnya', icon: 'MoreHorizontal', color: '#6B7280', budgetLimit: 0 },
];

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
}: TransactionModalProps) {
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Tentukan daftar kategori yang relevan
  const activeCategoryList =
    categories.length > 0
      ? categories
      : txType === 'income'
      ? DEFAULT_INCOME_CATEGORIES
      : DEFAULT_EXPENSE_CATEGORIES;

  useEffect(() => {
    if (initialData) {
      setTxType(initialData.type || 'expense');
      setTitle(initialData.title);
      setAmountStr(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setDate(initialData.date);
      setPaymentMethod(initialData.paymentMethod);
      setNotes(initialData.notes || '');
    } else {
      setTxType('expense');
      setTitle('');
      setAmountStr('');
      setCategoryId(activeCategoryList[0]?.id || '');
      setDate(getTodayString());
      setPaymentMethod('Tunai');
      setNotes('');
    }
    setErrorMessage('');
  }, [initialData, categories, isOpen]);

  // Saat beralih antara Pengeluaran dan Pemasukan
  const handleTypeChange = (newType: 'expense' | 'income') => {
    setTxType(newType);
    setErrorMessage('');
    const list =
      categories.length > 0
        ? categories
        : newType === 'income'
        ? DEFAULT_INCOME_CATEGORIES
        : DEFAULT_EXPENSE_CATEGORIES;
    if (!list.some((c) => c.id === categoryId)) {
      setCategoryId(list[0]?.id || '');
    }
  };

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmountStr(raw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage(`Keterangan ${txType === 'income' ? 'pemasukan' : 'pengeluaran'} harus diisi!`);
      return;
    }

    const numAmount = parseRupiahInput(amountStr);
    if (numAmount <= 0) {
      setErrorMessage(`Nominal harus lebih besar dari Rp 0!`);
      return;
    }

    const effectiveCatId = categoryId || activeCategoryList[0]?.id || 'cat-general';

    if (!date) {
      setErrorMessage('Pilih tanggal transaksi!');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        title: title.trim(),
        amount: numAmount,
        type: txType,
        categoryId: effectiveCatId,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedAmount = parseRupiahInput(amountStr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div
          className={`px-6 py-4.5 text-white flex items-center justify-between transition-colors ${
            txType === 'income'
              ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900'
              : 'bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900'
          }`}
        >
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              {txType === 'income' ? (
                <>
                  <ArrowDownLeft className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
                  <span>{initialData ? 'Edit Pemasukan' : 'Catat Pemasukan Baru'}</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5 text-rose-400 stroke-[2.5]" />
                  <span>{initialData ? 'Edit Pengeluaran' : 'Catat Pengeluaran Baru'}</span>
                </>
              )}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {txType === 'income'
                ? 'Catat uang masuk seperti gaji, bonus, usaha, atau transferan'
                : 'Catat pengeluaran Anda dengan detail untuk pelaporan keuangan'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 font-medium">
              <span className="font-bold">Perhatian:</span> {errorMessage}
            </div>
          )}

          {/* Type Toggle: PENGELUARAN vs PEMASUKAN */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Jenis Transaksi <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  txType === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Pengeluaran (Uang Keluar)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  txType === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Pemasukan (Uang Masuk)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Keterangan {txType === 'income' ? 'Pemasukan' : 'Pengeluaran'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  txType === 'income'
                    ? 'Contoh: Gaji Bulanan / Bonus Proyek / Uang Jajan'
                    : 'Contoh: Makan Siang Nasi Padang'
                }
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nominal {txType === 'income' ? 'Pemasukan' : 'Pengeluaran'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                Rp
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr ? new Intl.NumberFormat('id-ID').format(parseRupiahInput(amountStr)) : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-base focus:outline-hidden focus:ring-2 transition-all ${
                  txType === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500'
                    : 'text-slate-900 dark:text-white focus:ring-rose-500'
                }`}
                required
              />
            </div>
            {parsedAmount > 0 && (
              <p
                className={`mt-1 text-xs font-medium ${
                  txType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                Terbaca: {formatRupiah(parsedAmount)}
              </p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Kategori {txType === 'income' ? 'Pemasukan' : 'Pengeluaran'} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
              {activeCategoryList.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? txType === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
                          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} color={cat.color} size={15} />
                    <span className="truncate flex-1 font-semibold">{cat.name}</span>
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 ${
                          txType === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Metode / Rekening
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Catatan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Transfer gaji dari kantor / Catatan belanja"
              rows={2}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-3 flex items-center justify-end gap-2 sm:gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white active:scale-95 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                txType === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              {isSubmitting
                ? 'Menyimpan...'
                : initialData
                ? `Perbarui ${txType === 'income' ? 'Pemasukan' : 'Pengeluaran'}`
                : `+ Simpan ${txType === 'income' ? 'Pemasukan' : 'Pengeluaran'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
