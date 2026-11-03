'use client';

import React from 'react';
import { PlusCircle, Edit3, Trash2, Tag, Layers } from 'lucide-react';
import { Category, Transaction } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';

interface CategoryListProps {
  categories: Category[];
  transactions: Transaction[];
  onAddNew: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryList({
  categories,
  transactions,
  onAddNew,
  onEdit,
  onDelete,
}: CategoryListProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Kelola Kategori Pengeluaran</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah, edit, atau sesuaikan kategori pengeluaran dengan ikon dan warna pilihan Anda
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const catTxs = transactions.filter((t) => t.categoryId === cat.id);
          const totalSpent = catTxs.reduce((sum, t) => sum + t.amount, 0);

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CategoryIcon name={cat.icon} color={cat.color} size={22} />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{cat.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-[11px] text-slate-400 font-mono">
                          {cat.color}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Kategori"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!cat.isDefault && (
                      <button
                        onClick={() => onDelete(cat)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Total Transaksi</span>
                    <span className="text-sm font-bold text-slate-800">
                      {catTxs.length} Transaksi
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Total Nominal</span>
                    <span className="text-sm font-bold text-rose-600">
                      {formatRupiah(totalSpent)}
                    </span>
                  </div>
                </div>
              </div>

              {cat.budgetLimit > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Batas Anggaran:</span>
                  <span className="font-bold text-blue-600">
                    {formatRupiah(cat.budgetLimit)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
