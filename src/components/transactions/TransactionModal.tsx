'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  CreditCard,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Category, PaymentMethod, Transaction } from '@/lib/types';
import { formatRupiah, getTodayString, parseRupiahInput } from '@/lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';
import { CustomDropdown, DropdownOption } from '../ui/CustomDropdown';
import { getPaymentMethodIcon } from './TransactionFilter';

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

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 250000, 500000];

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

  // Tentukan daftar kategori yang relevan (Pisahkan Pemasukan vs Pengeluaran)
  const relevantCategories = categories.filter((c) =>
    txType === 'income'
      ? c.id.startsWith('cat-income') || c.id.includes('income')
      : !c.id.startsWith('cat-income') && !c.id.includes('income')
  );

  const activeCategoryList =
    relevantCategories.length > 0
      ? relevantCategories
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
      const defaultExpCats = categories.filter((c) => !c.id.startsWith('cat-income') && !c.id.includes('income'));
      setCategoryId(defaultExpCats[0]?.id || DEFAULT_EXPENSE_CATEGORIES[0]?.id || '');
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
    const list = categories.filter((c) =>
      newType === 'income'
        ? c.id.startsWith('cat-income') || c.id.includes('income')
        : !c.id.startsWith('cat-income') && !c.id.includes('income')
    );
    const fallbackList = list.length > 0 ? list : newType === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
    setCategoryId(fallbackList[0]?.id || '');
  };

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmountStr(raw);
  };

  const handleQuickAddAmount = (addAmount: number) => {
    const current = parseRupiahInput(amountStr);
    setAmountStr((current + addAmount).toString());
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
        {/* Header Bersih, Modern & Elegan */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs transition-colors ${
                txType === 'income'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {txType === 'income' ? (
                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {initialData
                  ? txType === 'income'
                    ? 'Edit Pemasukan'
                    : 'Edit Pengeluaran'
                  : txType === 'income'
                  ? 'Catat Pemasukan Baru'
                  : 'Catat Pengeluaran Baru'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {txType === 'income'
                  ? 'Catat uang masuk seperti gaji, bisnis, bonus, atau hadiah'
                  : 'Catat pengeluaran kebutuhan sehari-hari Anda'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-4.5 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <span className="font-bold">Perhatian:</span> {errorMessage}
            </div>
          )}

          {/* 1. Segmented Switcher: Pengeluaran vs Pemasukan (Modern iOS Style) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                txType === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Pengeluaran (Uang Keluar)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                txType === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Pemasukan (Uang Masuk)</span>
            </button>
          </div>

          {/* 2. Nominal Input Card (Hero Element) */}
          <div
            className={`rounded-2xl p-4 border transition-all ${
              txType === 'income'
                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
                : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[10px] uppercase tracking-wider">
                Nominal {txType === 'income' ? 'Pemasukan' : 'Pengeluaran'} *
              </span>
              {parsedAmount > 0 && (
                <span
                  className={`text-xs font-extrabold ${
                    txType === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatRupiah(parsedAmount)}
                </span>
              )}
            </div>

            <div className="relative flex items-center py-1">
              <span
                className={`text-xl sm:text-2xl font-black mr-2 select-none shrink-0 ${
                  txType === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr ? new Intl.NumberFormat('id-ID').format(parseRupiahInput(amountStr)) : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent font-black text-2xl sm:text-3xl text-slate-900 dark:text-white focus:outline-hidden tracking-tight placeholder:text-slate-300 dark:placeholder:text-slate-600"
                required
                autoFocus
              />
            </div>

            {/* Quick Chips Tambah Nominal */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">
                Pilihan Cepat:
              </span>
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  +{val >= 1000 ? `${val / 1000}rb` : val}
                </button>
              ))}
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="px-2 py-0.5 text-slate-400 hover:text-rose-500 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-0.5"
                  title="Hapus Nilai"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Keterangan Transaksi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Keterangan {txType === 'income' ? 'Pemasukan' : 'Pengeluaran'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                txType === 'income'
                  ? 'Contoh: Gaji Bulanan, Bonus Proyek, Uang Jajan'
                  : 'Contoh: Makan Siang Nasi Padang, Belanja Mingguan'
              }
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400"
              required
            />
          </div>

          {/* 4. Pemilih Kategori (4 Kolom Mewah, Ikon di Atas, Teks Utuh Tanpa Terpotong "...") */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Kategori {txType === 'income' ? 'Pemasukan' : 'Pengeluaran'} <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Pilih salah satu
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {activeCategoryList.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer text-center relative group active:scale-95 ${
                      isSelected
                        ? txType === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 shadow-sm ring-2 ring-rose-500/20'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} color={cat.color} size={18} />
                    <span
                      className={`text-[11px] font-semibold mt-1.5 leading-tight line-clamp-2 text-center ${
                        isSelected
                          ? txType === 'income'
                            ? 'text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'text-rose-900 dark:text-rose-200 font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cat.name}
                    </span>

                    {isSelected && (
                      <span
                        className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black shadow-xs ${
                          txType === 'income' ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Tanggal & Metode / Rekening */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tanggal Transaksi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Metode / Rekening
              </label>
              <CustomDropdown
                value={paymentMethod}
                onChange={(val) => setPaymentMethod(val as PaymentMethod)}
                options={PAYMENT_METHODS.map((method) => ({
                  value: method,
                  label: method,
                  icon: getPaymentMethodIcon(method),
                }))}
                size="md"
              />
            </div>
          </div>

          {/* 6. Catatan Tambahan (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Catatan Tambahan <span className="text-slate-400 font-normal lowercase">(opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                txType === 'income'
                  ? 'Misal: Transfer gaji bulanan kantor, bonus lembur, dll.'
                  : 'Misal: Makan siang bareng rekan kerja, diskon promo, dll.'
              }
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all resize-none placeholder:text-slate-400"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
              txType === 'income'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/20'
            }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isSubmitting
                ? 'Menyimpan...'
                : initialData
                ? `Perbarui ${txType === 'income' ? 'Pemasukan' : 'Pengeluaran'}`
                : `Simpan ${txType === 'income' ? 'Pemasukan' : 'Pengeluaran'}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
