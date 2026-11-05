'use client';

import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface BackupRestoreProps {
  onRefreshData: () => Promise<void>;
  userId?: string;
}

export function BackupRestore({
  onRefreshData,
  userId,
}: BackupRestoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const handleDownloadBackup = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('Gagal mengunduh backup');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DompetKu-Backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatusMessage({ type: 'success', text: 'File backup JSON berhasil diunduh!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengunduh backup' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal memulihkan backup');
      }

      await onRefreshData();
      setStatusMessage({ type: 'success', text: 'Data berhasil dipulihkan dari file backup!' });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'File tidak valid atau rusak.',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSeedDemo = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      await onRefreshData();
      setStatusMessage({ type: 'success', text: 'Data contoh pengeluaran berhasil dimuat!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal memuat data contoh' });
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleResetData = async () => {
    try {
      setIsProcessing(true);
      const url = `/api/seed?action=reset${userId ? `&userId=${userId}` : ''}`;
      const res = await fetch(url, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      if (userId) {
        try {
          localStorage.removeItem(`dompetku-cache-${userId}`);
        } catch (e) {}
      }

      await onRefreshData();
      setStatusMessage({ type: 'success', text: 'Semua data transaksi berhasil dibersihkan!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mereset data' });
    } finally {
      setIsProcessing(false);
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Backup & Restore Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Cadangkan Data (Backup JSON)</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">Unduh seluruh catatan transaksi dan kategori</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Simpan salinan data Anda ke dalam file JSON di komputer atau HP Anda agar tidak pernah kehilangan riwayat keuangan pribadi.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Cadangan Data (.json)</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Pulihkan Data (Restore JSON)</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">Unggah file backup JSON yang sebelumnya diunduh</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Muat kembali seluruh transaksi, anggaran, dan kategori dari file cadangan yang telah tersimpan.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih File Backup untuk Dipulihkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Demo Data & Reset Actions */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Pengelolaan Data Tambahan</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Muat data simulasi untuk pengetesan atau kosongkan catatan
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                title: 'Muat Data Contoh?',
                message:
                  'Tindakan ini akan memuat transaksi contoh di bulan berjalan dan bulan lalu untuk demonstrasi grafik dan laporan Excel.',
                action: handleSeedDemo,
              })
            }
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Data Contoh (Demo)</span>
          </button>

          <button
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                title: 'Hapus Semua Catatan Transaksi?',
                message:
                  'PERINGATAN: Seluruh riwayat transaksi akan dihapus secara permanen. Pastikan Anda telah mengunduh backup terlebih dahulu!',
                action: handleResetData,
              })
            }
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Bersihkan Semua Transaksi</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}
