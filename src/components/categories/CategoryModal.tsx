'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '@/lib/types';
import { formatRupiah, parseRupiahInput } from '@/lib/formatters';
import { AVAILABLE_ICONS, CategoryIcon } from '../ui/CategoryIcon';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id'>) => Promise<void>;
  initialData?: Category | null;
}

const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F97316', // Orange
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#EAB308', // Amber
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#64748B', // Slate
];

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#3B82F6');
  const [budgetLimitStr, setBudgetLimitStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIcon(initialData.icon);
      setColor(initialData.color);
      setBudgetLimitStr(initialData.budgetLimit ? initialData.budgetLimit.toString() : '');
    } else {
      setName('');
      setIcon('Tag');
      setColor('#3B82F6');
      setBudgetLimitStr('');
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Nama kategori wajib diisi!');
      return;
    }

    const budgetLimit = parseRupiahInput(budgetLimitStr);

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        icon,
        color,
        budgetLimit,
        isDefault: initialData?.isDefault || false,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {initialData ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              Atur nama, ikon, dan batas anggaran kategori
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Name & Preview */}
          <div className="flex items-center gap-3">
            <CategoryIcon name={icon} color={color} size={24} />
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Kategori <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Belanja Bulanan"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Ikon
            </label>
            <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                const isSelected = icon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setIcon(iconKey)}
                    className={`flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CategoryIcon
                      name={iconKey}
                      color={isSelected ? '#FFFFFF' : '#475569'}
                      size={16}
                      withBg={false}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Warna
            </label>
            <div className="flex flex-wrap gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {COLOR_PRESETS.map((hex) => {
                const isSelected = color.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Budget Limit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Batas Anggaran Bulanan (Opsional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                Rp
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={
                  budgetLimitStr
                    ? new Intl.NumberFormat('id-ID').format(parseRupiahInput(budgetLimitStr))
                    : ''
                }
                onChange={(e) => setBudgetLimitStr(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0 (tidak ada batas)"
                className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            {parseRupiahInput(budgetLimitStr) > 0 && (
              <p className="mt-1 text-xs text-blue-600 font-medium">
                Batas:{' '}
                {formatRupiah(parseRupiahInput(budgetLimitStr))} / bulan
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
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
              {isSubmitting ? 'Menyimpan...' : initialData ? 'Perbarui Kategori' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
