'use client';

import React from 'react';
import {
  FileText,
  Calendar,
  CreditCard,
  Tag,
  Eye,
  Edit3,
  Trash2,
  TrendingDown,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Category, Transaction } from '@/lib/types';
import { formatDateIndonesian, formatRupiah } from '@/lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onSelect: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onAddNew: () => void;
}

export function TransactionList({
  transactions,
  categories,
  onSelect,
  onEdit,
  onDelete,
  onAddNew,
}: TransactionListProps) {
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const totalFilteredExpense = transactions
    .filter((t) => t.type !== 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200/80 dark:border-slate-800 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FileText className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Tidak ada transaksi ditemukan</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Tidak ada data transaksi yang cocok dengan kriteria filter Anda, atau belum ada transaksi yang dicatat.
        </p>
        <button
          onClick={onAddNew}
          className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-200 dark:shadow-none transition-all cursor-pointer active:scale-95"
        >
          + Catat Transaksi Baru
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">{transactions.length}</span> Transaksi Ditemukan
        </div>
        <div className="flex items-center gap-4 text-xs font-bold flex-wrap">
          {totalFilteredIncome > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="font-normal text-slate-500">Pemasukan:</span>
              <span>+{formatRupiah(totalFilteredIncome)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="font-normal text-slate-500">Pengeluaran:</span>
            <span>-{formatRupiah(totalFilteredExpense)}</span>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Card List */}
      <div className="block lg:hidden space-y-3">
        {transactions.map((tx) => {
          const cat = categoryMap.get(tx.categoryId);
          const isIncome = tx.type === 'income';

          return (
            <div
              key={tx.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <CategoryIcon
                        name={cat?.icon || 'Tag'}
                        color={cat?.color || '#EF4444'}
                        size={18}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4
                      onClick={() => onSelect(tx)}
                      className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          isIncome
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isIncome ? 'Pemasukan' : cat?.name || 'Pengeluaran'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-black block ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {tx.paymentMethod}
                  </span>
                </div>
              </div>

              {tx.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl italic">
                  &ldquo;{tx.notes}&rdquo;
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateIndonesian(tx.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelect(tx)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(tx)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(tx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW: Data Table */}
      <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {transactions.map((tx, idx) => {
                const cat = categoryMap.get(tx.categoryId);
                const isIncome = tx.type === 'income';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDateIndonesian(tx.date)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          isIncome
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td
                      onClick={() => onSelect(tx)}
                      className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 transition-colors"
                    >
                      {tx.title}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CategoryIcon
                          name={cat?.icon || 'Tag'}
                          color={cat?.color || '#3B82F6'}
                          size={14}
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cat?.name || 'Lain-lain'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-medium text-[11px]">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-black whitespace-nowrap ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                      {tx.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(tx);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(tx);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Transaksi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(tx);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
