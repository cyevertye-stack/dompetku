'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard, FileText, Check } from 'lucide-react';
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

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
}: TransactionModalProps) {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmountStr(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setDate(initialData.date);
      setPaymentMethod(initialData.paymentMethod);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setAmountStr('');
      setCategoryId(categories[0]?.id || '');
      setDate(getTodayString());
      setPaymentMethod('Tunai');
      setNotes('');
    }
    setErrorMessage('');
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmountStr(raw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Keterangan pengeluaran harus diisi!');
      return;
    }

    const numAmount = parseRupiahInput(amountStr);
    if (numAmount <= 0) {
      setErrorMessage('Nominal pengeluaran harus lebih besar dari Rp 0!');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Pilih kategori pengeluaran!');
      return;
    }

    if (!date) {
      setErrorMessage('Pilih tanggal pengeluaran!');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        title: title.trim(),
        amount: numAmount,
        categoryId,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {initialData ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              Catat pengeluaran Anda dengan detail untuk pelaporan akurat
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4.5 flex-1">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <span className="font-semibold">Perhatian:</span> {errorMessage}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Keterangan Pengeluaran <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Makan Siang Nasi Padang"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nominal Pengeluaran <span className="text-rose-500">*</span>
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
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-base focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                required
              />
            </div>
            {parsedAmount > 0 && (
              <p className="mt-1 text-xs text-blue-600 font-medium">
                Terbaca: {formatRupiah(parsedAmount)}
              </p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kategori Pengeluaran <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} color={cat.color} size={15} />
                    <span className="truncate flex-1 font-semibold">{cat.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Dibeli saat istirahat siang bersama rekan kerja"
              rows={2}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : initialData ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
