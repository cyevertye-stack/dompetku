'use client';

import React from 'react';
import { X, Calendar, CreditCard, Tag, FileText, Trash2, Edit3 } from 'lucide-react';
import { Category, Transaction } from '@/lib/types';
import { formatDateIndonesian, formatRupiah } from '@/lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  category?: Category;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  category,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header Banner */}
        <div
          className={`p-6 text-white relative transition-colors ${
            transaction.type === 'income'
              ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900'
              : 'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <span
            className={`inline-block px-2.5 py-1 backdrop-blur-xs rounded-full text-xs font-semibold uppercase tracking-wider mb-2 ${
              transaction.type === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {transaction.type === 'income' ? 'Detail Pemasukan' : 'Detail Pengeluaran'}
          </span>
          <h2 className="text-xl font-bold tracking-tight">{transaction.title}</h2>
          <div
            className={`mt-3 text-2xl font-extrabold ${
              transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'} {formatRupiah(transaction.amount)}
          </div>
        </div>

        {/* Details list */}
        <div className="p-6 space-y-4">
          {/* Category */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <CategoryIcon
                name={category?.icon || 'Tag'}
                color={category?.color || '#3B82F6'}
                size={18}
              />
              <div>
                <span className="text-xs text-slate-400 font-medium block">Kategori</span>
                <span className="text-sm font-bold text-slate-800">
                  {category?.name || 'Lain-lain'}
                </span>
              </div>
            </div>
            {category?.budgetLimit ? (
              <span className="text-xs text-slate-500 font-medium">
                Batas: {formatRupiah(category.budgetLimit)}
              </span>
            ) : null}
          </div>

          {/* Date */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="p-2.5 bg-blue-100/60 text-blue-700 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Tanggal Transaksi</span>
              <span className="text-sm font-bold text-slate-800">
                {formatDateIndonesian(transaction.date, true)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="p-2.5 bg-emerald-100/60 text-emerald-700 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Metode Pembayaran</span>
              <span className="text-sm font-bold text-slate-800">{transaction.paymentMethod}</span>
            </div>
          </div>

          {/* Notes */}
          {transaction.notes && (
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2.5 bg-amber-100/60 text-amber-700 rounded-xl shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Catatan Tambahan</span>
                <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">
                  {transaction.notes}
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-slate-400 text-center pt-1">
            ID: <span className="font-mono">{transaction.id}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            className="flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-medium text-sm transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl font-medium text-sm transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(transaction);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-200 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
