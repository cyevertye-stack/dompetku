'use client';

import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  LogOut,
  Receipt,
  PiggyBank,
  Tag,
  Sparkles,
} from 'lucide-react';
import { User } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';
import { BackupRestore } from '../settings/BackupRestore';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface ProfileSettingsViewProps {
  currentUser: User | null;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  transactionCount: number;
  totalSavingsValue: number;
  categoryCount: number;
  onRefreshData: () => Promise<void>;
}

export function ProfileSettingsView({
  currentUser,
  onUpdateUser,
  onLogout,
  transactionCount,
  totalSavingsValue,
  categoryCount,
  onRefreshData,
}: ProfileSettingsViewProps) {
  const [name, setName] = useState(currentUser?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Nama profil tidak boleh kosong!' });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);

      const trimmedName = name.trim();

      // Call server API
      if (currentUser?.id) {
        try {
          await fetch('/api/auth?action=update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentUser.id, name: trimmedName }),
          });
        } catch (e) {
          // continue with local update
        }

        // Update local accounts cache
        try {
          const rawAccs = localStorage.getItem('dompetku-accounts');
          if (rawAccs) {
            const accs = JSON.parse(rawAccs);
            const idx = accs.findIndex((a: any) => a.id === currentUser.id);
            if (idx >= 0) {
              accs[idx].name = trimmedName;
              localStorage.setItem('dompetku-accounts', JSON.stringify(accs));
            }
          }
        } catch (e) {}

        const updatedUser: User = {
          ...currentUser,
          name: trimmedName,
        };

        // Update active session in localStorage
        localStorage.setItem('dompetku-user', JSON.stringify(updatedUser));
        onUpdateUser(updatedUser);
      }

      setIsEditingName(false);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui profil' });
    } finally {
      setIsSaving(false);
    }
  };

  const initialLetter = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : 'U';

  const formattedJoinDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '3 November 2026';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Halaman yang Bersih */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Profil & Pengaturan
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola informasi profil akun Anda dan pencadangan data keuangan DompetKu
        </p>
      </div>

      {/* Alert Notifikasi */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Kartu Profil Pengguna (User Profile Card) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            {/* Avatar Besar */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg shadow-blue-500/25 uppercase border-2 border-white dark:border-slate-800">
                {initialLetter}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs"
                title="Akun Aktif"
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Info Nama & Email */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {currentUser?.name || 'Pengguna DompetKu'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Akun Terdaftar</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{currentUser?.email || 'email@dompetku.local'}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Terdaftar: {formattedJoinDate}</span>
              </div>
            </div>
          </div>

          {/* Tombol Logout & Edit */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setIsEditingName(!isEditingName)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isEditingName ? 'Batal Ubah' : 'Ubah Nama'}
            </button>

            <button
              onClick={() => setIsLogoutDialogOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/60 dark:border-rose-900/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Form Edit Nama (Jika Mode Edit Aktif) */}
        {isEditingName && (
          <form
            onSubmit={handleSaveProfile}
            className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in"
          >
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nama Lengkap Baru
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama tampilan baru Anda"
                className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Nama'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Ringkasan Statistik Akun */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Ringkasan Aktivitas Akun
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Card 1: Total Transaksi */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Total Transaksi</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {transactionCount} Catatan
                </span>
              </div>
            </div>

            {/* Card 2: Total Tabungan & Emas */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-slate-400 block truncate">Total Tabungan</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 truncate block">
                  {formatRupiah(totalSavingsValue)}
                </span>
              </div>
            </div>

            {/* Card 3: Kategori Aktif */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Kategori Aktif</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {categoryCount} Kategori
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Cadangan & Pemulihan Data JSON */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Cadangan & Pemulihan Data
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Amankan data transaksi Anda dalam file JSON atau pulihkan data sebelumnya
          </p>
        </div>

        <BackupRestore onRefreshData={onRefreshData} />
      </div>

      {/* Konfirmasi Logout */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        title="Keluar dari Akun?"
        message="Sesi Anda akan diakhiri. Anda dapat masuk kembali kapan saja dengan email dan kata sandi Anda."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={async () => {
          setIsLogoutDialogOpen(false);
          onLogout();
        }}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  );
}
