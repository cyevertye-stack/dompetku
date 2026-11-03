'use client';

import React from 'react';
import { X, Cloud, Database, CheckCircle2, Copy, ExternalLink, Zap } from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeploymentGuideModal({ isOpen, onClose }: DeploymentGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-300">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Panduan Deploy ke Vercel & Rekomendasi Database Online
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Solusi hosting gratis, cepat, dan siap pakai produksi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300 flex-1">
          {/* Recommendation 1 */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[11px] font-extrabold rounded-md uppercase">
                Rekomendasi Utama #1
              </span>
              <h4 className="font-extrabold text-blue-950 dark:text-blue-200 text-base">
                Neon Serverless PostgreSQL (neon.tech)
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <b>Mengapa Neon?</b> Neon adalah penyedia database serverless PostgreSQL gratis terbaik untuk Vercel. Didesain secara khusus agar tidak mengalami kendala <i>connection pool exhaustion</i> pada fungsi serverless Vercel.
            </p>
            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside">
              <li><b>Gratis:</b> 0.5 GB storage, unlimited branching.</li>
              <li><b>Connection Pooling:</b> Sudah terpasang otomatis (cocok 100% untuk Prisma & Next.js).</li>
              <li><b>Integrasi Vercel:</b> Dapat dihubungkan langsung dari dashboard Vercel Integrations.</li>
            </ul>
          </div>

          {/* Recommendation 2 */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[11px] font-extrabold rounded-md uppercase">
                Rekomendasi Alternatif #2
              </span>
              <h4 className="font-extrabold text-emerald-950 dark:text-emerald-200 text-base">
                Supabase PostgreSQL (supabase.com)
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <b>Mengapa Supabase?</b> Supabase memberikan database PostgreSQL gratis dengan kapasitas 500 MB dan memiliki panel admin visual (Table Editor) yang sangat intuitif untuk melihat dan mengedit data tabel layaknya spreadsheet.
            </p>
          </div>

          {/* Step by step deploy */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              Langkah-Langkah Deploy ke Vercel (Mudah & Cepat)
            </h4>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">Buat Database di Neon / Supabase</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Daftar di <b>neon.tech</b> atau <b>supabase.com</b>, buat project baru, lalu salin URL koneksi database:
                  </p>
                  <code className="block mt-1.5 p-2 bg-slate-900 text-emerald-400 text-[11px] rounded-lg font-mono">
                    DATABASE_URL="postgresql://user:password@ep-sample.neon.tech/neondb?sslmode=require"
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">Unggah Kode ke GitHub</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Buat repositori baru di GitHub Anda, lalu push proyek ini:
                  </p>
                  <code className="block mt-1.5 p-2 bg-slate-900 text-slate-200 text-[11px] rounded-lg font-mono">
                    git add .<br />
                    git commit -m "DompetKu first commit"<br />
                    git push origin main
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">Import Project di Vercel</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Buka <b>vercel.com</b>, login dengan GitHub, pilih <b>Add New Project</b>, lalu pilih repositori DompetKu.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">Tambahkan Environment Variable</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pada menu <b>Environment Variables</b> di Vercel, tambahkan:
                  </p>
                  <div className="mt-1 text-xs">
                    <b>Key:</b> <code className="text-blue-600 dark:text-blue-400 font-mono">DATABASE_URL</code> <br />
                    <b>Value:</b> <code className="text-slate-600 dark:text-slate-300 font-mono">[URL koneksi Neon/Supabase Anda]</code>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-white text-xs">Deploy Selesai!</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Klik <b>Deploy</b>. Dalam hitungan detik, aplikasi DompetKu Anda akan live dan dapat diakses dari laptop maupun HP melalui domain gratis seperti <code className="text-blue-600 dark:text-blue-400 font-mono">https://dompetku.vercel.app</code>!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
