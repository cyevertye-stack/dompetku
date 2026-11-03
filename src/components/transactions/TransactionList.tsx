'use client';

import React from 'react';
import { Eye, Edit3, Trash2, Calendar, CreditCard, FileText } from 'lucide-react';
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

  const totalFilteredAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FileText className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-slate-800">Tidak ada transaksi ditemukan</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Tidak ada data transaksi yang cocok dengan kriteria filter Anda, atau belum ada transaksi yang dicatat.
        </p>
        <button
          onClick={onAddNew}
          className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer"
        >
          + Tambah Pengeluaran Baru
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-900">{transactions.length}</span> Transaksi Ditemukan
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 mr-2">Total Nominal:</span>
          <span className="text-base font-black text-rose-600">
            {formatRupiah(totalFilteredAmount)}
          </span>
        </div>
      </div>

      {/* MOBILE VIEW: Card List */}
      <div className="block lg:hidden space-y-3">
        {transactions.map((tx) => {
          const cat = categoryMap.get(tx.categoryId);
          return (
            <div
              key={tx.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon
                    name={cat?.icon || 'Tag'}
                    color={cat?.color || '#3B82F6'}
                    size={20}
                  />
                  <div className="min-w-0">
                    <h4
                      onClick={() => onSelect(tx)}
                      className="text-sm font-bold text-slate-800 truncate hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {tx.title}
                    </h4>
                    <span className="inline-block mt-0.5 text-xs text-slate-400 font-medium">
                      {cat?.name || 'Lain-lain'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-rose-600 block">
                    - {formatRupiah(tx.amount)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {tx.paymentMethod}
                  </span>
                </div>
              </div>

              {tx.notes && (
                <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl italic">
                  "{tx.notes}"
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateIndonesian(tx.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelect(tx)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(tx)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(tx)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW: Table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {transactions.map((tx, idx) => {
                const cat = categoryMap.get(tx.categoryId);
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {formatDateIndonesian(tx.date)}
                    </td>
                    <td
                      onClick={() => onSelect(tx)}
                      className="py-3 px-4 font-bold text-slate-800 hover:text-blue-600 transition-colors"
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
                        <span className="font-semibold text-slate-700">
                          {cat?.name || 'Lain-lain'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 rounded-md font-medium text-[11px]">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-600 whitespace-nowrap">
                      - {formatRupiah(tx.amount)}
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
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(tx);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Transaksi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(tx);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
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
