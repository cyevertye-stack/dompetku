'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Scale,
  Award,
  MapPin,
  BadgeCheck,
  Gem,
  Store,
  Tag,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';
import { GoldSavings, GoldType } from '@/lib/types';

interface GoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGold: (gold: Partial<GoldSavings>) => Promise<void>;
  userId?: string;
}

const GOLD_TYPES: GoldType[] = [
  'Antam',
  'UBS',
  'Galeri 24',
  'Perhiasan',
  'Emas Digital',
  'Lotus Archi',
  'Dinar / Koin Emas',
  'Lainnya',
];

const JEWELRY_TYPES = [
  { label: 'Cincin', icon: '💍' },
  { label: 'Kalung', icon: '📿' },
  { label: 'Gelang', icon: '🪙' },
  { label: 'Anting', icon: '✨' },
  { label: 'Liontin', icon: '💎' },
  { label: 'Set Perhiasan', icon: '👑' },
  { label: 'Lainnya', icon: '🏷️' },
];

const KARAT_PRESETS = [
  { label: '24K (99.9%)', value: '24K (99.9%)' },
  { label: '22K (91.6%)', value: '22K (91.6%)' },
  { label: 'Kadar 750 (18K)', value: 'Kadar 750 (18K)' },
  { label: 'Kadar 700 (17K)', value: 'Kadar 700 (17K)' },
  { label: 'Kadar 420 (10K)', value: 'Kadar 420 (10K)' },
  { label: 'Kadar 375 (9K)', value: 'Kadar 375 (9K)' },
];

const QUICK_GRAMS = [0.5, 1, 2, 3, 5, 10, 25];

export function GoldModal({ isOpen, onClose, onSaveGold, userId }: GoldModalProps) {
  const [goldType, setGoldType] = useState<GoldType>('Antam');
  const [karat, setKarat] = useState<string>('24K (99.9%)');
  const [jewelryType, setJewelryType] = useState<string>('Cincin');
  const [itemName, setItemName] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [weightGrams, setWeightGrams] = useState<string>('1');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [storageLocation, setStorageLocation] = useState<string>('Brankas Rumah');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGoldType('Antam');
      setKarat('24K (99.9%)');
      setJewelryType('Cincin');
      setItemName('');
      setStoreName('');
      setWeightGrams('1');
      setPurchasePrice('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setStorageLocation('Brankas Rumah');
      setSerialNumber('');
      setNotes('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numGrams = parseFloat(weightGrams) || 0;
  const numPrice = parseInt(purchasePrice.replace(/[^0-9]/g, ''), 10) || 0;
  const pricePerGram = numGrams > 0 && numPrice > 0 ? Math.round(numPrice / numGrams) : 0;

  const handleTypeSelect = (t: GoldType) => {
    setGoldType(t);
    if (t === 'Antam' || t === 'UBS' || t === 'Galeri 24') {
      setKarat('24K (99.9%)');
    } else if (t === 'Perhiasan') {
      setKarat('Kadar 750 (18K)');
      if (!itemName) setItemName('Cincin Emas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!karat.trim()) {
      setError('Masukkan kadar atau karat emas (bisa ditulis manual)');
      return;
    }

    if (numGrams <= 0) {
      setError('Masukkan berat emas dalam gram yang valid');
      return;
    }

    if (numPrice <= 0) {
      setError('Masukkan total harga beli emas');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveGold({
        userId,
        type: goldType,
        karat: karat.trim(),
        jewelryType: goldType === 'Perhiasan' ? jewelryType : undefined,
        itemName: goldType === 'Perhiasan' ? itemName.trim() : undefined,
        storeName: storeName.trim() || undefined,
        weightGrams: numGrams,
        purchasePrice: numPrice,
        pricePerGram,
        purchaseDate,
        storageLocation: storageLocation.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan tabungan emas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Emas Mewah */}
        <div className="p-5 border-b border-amber-100 dark:border-amber-950/40 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-yellow-400 text-white rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                <span>Catat Tabungan Emas</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logam Mulia (Antam, UBS), Perhiasan Emas, atau Emas Digital
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form id="gold-form" onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Tipe Emas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tipe / Bentuk Emas *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GOLD_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeSelect(t)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                    goldType === t
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                  }`}
                >
                  {t === 'Perhiasan' ? '💎 Perhiasan' : t}
                </button>
              ))}
            </div>
          </div>

          {/* KHUSUS PERHIASAN: Jenis Perhiasan & Nama Model */}
          {goldType === 'Perhiasan' && (
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Gem className="w-4 h-4 text-amber-500" />
                <span>Rincian Perhiasan Emas</span>
              </div>

              {/* Jenis Perhiasan */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Jenis Barang
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {JEWELRY_TYPES.map((j) => (
                    <button
                      key={j.label}
                      type="button"
                      onClick={() => setJewelryType(j.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 ${
                        jewelryType === j.label
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{j.icon}</span>
                      <span>{j.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Barang / Model */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nama / Model Perhiasan
                </label>
                <input
                  type="text"
                  placeholder="Misal: Cincin Solitaire Permata, Kalung Rantai Nori"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Toko Emas / Surat Pembelian */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Toko Emas / Bukti Surat
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Misal: Toko Emas Semar Nusantara / Ada Surat"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* KADAR / KARAT EMAS (BISA TULIS MANUAL & ADA CHIP PILIHAN CEPAT) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Kadar Karat Emas (Bisa Tulis Manual) *</span>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Ketik bebas atau klik pilihan di bawah
              </span>
            </label>
            <div className="relative">
              <Award className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                required
                placeholder="Misal: Kadar 70%, Kadar 750, 17K, 22K, 99.9%, dll."
                value={karat}
                onChange={(e) => setKarat(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Rekomendasi:</span>
              {KARAT_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setKarat(p.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                    karat === p.value
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Berat Gramasi & Quick Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Berat Emas (Gram) *</span>
              <span className="text-[11px] text-slate-400">Bisa desimal, misal: 0.25 gr</span>
            </label>
            <div className="relative">
              <Scale className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.001"
                min="0.001"
                required
                placeholder="Contoh: 1"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                className="w-full pl-10 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                Gram
              </span>
            </div>

            {/* Quick Grams */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Pilihan Cepat:</span>
              {QUICK_GRAMS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setWeightGrams(g.toString())}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                >
                  {g} gr
                </button>
              ))}
            </div>
          </div>

          {/* Total Harga Beli */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Total Harga Beli (Rp) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                required
                placeholder="0"
                value={purchasePrice ? Number(purchasePrice).toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setPurchasePrice(raw);
                }}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {pricePerGram > 0 && (
              <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                Estimasi harga per gram: {formatRupiah(pricePerGram)} / gr
              </p>
            )}
          </div>

          {/* Tanggal Beli */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tanggal Beli *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Lokasi Simpan & Nomor Sertifikat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Lokasi Simpan
              </label>
              <input
                type="text"
                placeholder="Misal: Brankas Rumah / Kotak Perhiasan"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                No. Sertifikat / No. Nota (Opsional)
              </label>
              <input
                type="text"
                placeholder="Misal: AB-982736 / Nota-012"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Misal: Mas kawin, hadiah ulang tahun, ada batu permata, dll."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="gold-form"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            <BadgeCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Tabungan Emas'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
