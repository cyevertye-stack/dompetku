'use client';

import React from 'react';
import { PlusCircle, Edit3, Trash2, Tag, Sparkles } from 'lucide-react';
import { Category, Transaction } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';
import { TEMPLATE_CATEGORIES } from '@/lib/sample-data';

interface CategoryListProps {
  categories: Category[];
  transactions: Transaction[];
  onAddNew: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onLoadTemplateCategories?: () => void;
}

export function CategoryList({
  categories,
  transactions,
  onAddNew,
  onEdit,
  onDelete,
  onLoadTemplateCategories,
}: CategoryListProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Kelola Kategori Pengeluaran
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Atur dan sesuaikan kategori kebutuhan dengan ikon serta warna pilihan Anda sendiri
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-200 dark:shadow-none transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Empty State if categories are empty */}
      {categories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-14 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Tag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Belum Ada Kategori Pengeluaran
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Daftar kategori masih bersih. Anda dapat membuat kategori sendiri satu per satu sesuai dengan kebutuhan pos keuangan Anda.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onAddNew}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-200 dark:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Buat Kategori Pertama</span>
            </button>

            {onLoadTemplateCategories && (
              <button
                onClick={onLoadTemplateCategories}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gunakan Kategori Rekomendasi (9 Pos)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const catTxs = transactions.filter((t) => t.categoryId === cat.id);
            const totalSpent = catTxs.reduce((sum, t) => sum + t.amount, 0);

            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon name={cat.icon} color={cat.color} size={22} />
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                          {cat.name}
                        </h3>
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
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Kategori"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(cat)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Total Transaksi</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {catTxs.length} Transaksi
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Total Nominal</span>
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        {formatRupiah(totalSpent)}
                      </span>
                    </div>
                  </div>
                </div>

                {cat.budgetLimit > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Batas Anggaran:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {formatRupiah(cat.budgetLimit)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
