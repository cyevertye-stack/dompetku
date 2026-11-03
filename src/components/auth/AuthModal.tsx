'use client';

import React, { useState } from 'react';
import { LogIn, UserPlus, Lock, Mail, User, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { User as UserType } from '@/lib/types';

interface AuthModalProps {
  onLoginSuccess: (user: UserType) => void;
}

interface CachedAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

async function browserHash(text: string): Promise<string> {
  try {
    const msgUint8 = new TextEncoder().encode(text + 'dompetku_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return btoa(text);
  }
}

function getLocalAccounts(): CachedAccount[] {
  try {
    const raw = localStorage.getItem('dompetku-accounts');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalAccount(account: CachedAccount): void {
  try {
    const accounts = getLocalAccounts();
    const idx = accounts.findIndex((a) => a.email.toLowerCase() === account.email.toLowerCase());
    if (idx >= 0) {
      accounts[idx] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem('dompetku-accounts', JSON.stringify(accounts));
  } catch (e) {}
}

export function AuthModal({ onLoginSuccess }: AuthModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.toLowerCase().trim();

    if (!isLoginTab) {
      if (!name.trim()) {
        setErrorMessage('Nama lengkap wajib diisi!');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi kata sandi tidak cocok!');
        return;
      }
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Format email tidak valid!');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter!');
      return;
    }

    try {
      setIsLoading(true);
      const action = isLoginTab ? 'login' : 'register';
      const payload = isLoginTab
        ? { email: cleanEmail, password }
        : { name: name.trim(), email: cleanEmail, password };

      const pHash = await browserHash(password);

      // 1. REGISTER
      if (!isLoginTab) {
        let registeredUser: UserType | null = null;
        try {
          const res = await fetch(`/api/auth?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const result = await res.json();
          if (res.ok && result.success && result.data) {
            registeredUser = result.data;
          } else if (result.message && result.message.includes('sudah terdaftar')) {
            throw new Error(result.message);
          }
        } catch (serverErr: any) {
          if (serverErr.message && serverErr.message.includes('sudah terdaftar')) {
            throw serverErr;
          }
        }

        // If server failed (e.g. read-only serverless / Supabase table not created yet), create persistent local account
        if (!registeredUser) {
          const localAccs = getLocalAccounts();
          if (localAccs.some((a) => a.email.toLowerCase() === cleanEmail)) {
            throw new Error('Email sudah terdaftar. Silakan login!');
          }
          registeredUser = {
            id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: name.trim(),
            email: cleanEmail,
            createdAt: new Date().toISOString(),
          };
        }

        // Always save to local accounts cache
        saveLocalAccount({
          id: registeredUser.id,
          name: registeredUser.name,
          email: registeredUser.email,
          passwordHash: pHash,
          createdAt: registeredUser.createdAt,
        });

        // Set active session
        localStorage.setItem('dompetku-user', JSON.stringify(registeredUser));
        onLoginSuccess(registeredUser);
        return;
      }

      // 2. LOGIN
      let loggedInUser: UserType | null = null;
      try {
        const res = await fetch(`/api/auth?action=login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok && result.success && result.data) {
          loggedInUser = result.data;
        }
      } catch (e) {
        // network or server error, fallback to local check
      }

      // 2B. If server didn't find or serverless reset, check local persistent accounts
      if (!loggedInUser) {
        const localAccs = getLocalAccounts();
        const found = localAccs.find(
          (a) => a.email.toLowerCase() === cleanEmail && a.passwordHash === pHash
        );
        if (found) {
          loggedInUser = {
            id: found.id,
            name: found.name,
            email: found.email,
            createdAt: found.createdAt,
          };
        }
      }

      if (!loggedInUser) {
        throw new Error('Email atau kata sandi tidak cocok!');
      }

      // Save user to localStorage
      localStorage.setItem('dompetku-user', JSON.stringify(loggedInUser));
      saveLocalAccount({
        id: loggedInUser.id,
        name: loggedInUser.name,
        email: loggedInUser.email,
        passwordHash: pHash,
        createdAt: loggedInUser.createdAt,
      });

      onLoginSuccess(loggedInUser);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses autentikasi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser: UserType = {
      id: 'guest-user',
      name: 'Pengguna Tamu',
      email: 'tamu@dompetku.local',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('dompetku-user', JSON.stringify(guestUser));
    onLoginSuccess(guestUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header Branding */}
        <div className="p-8 pb-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <img
            src="/icon-192.png"
            alt="DompetKu"
            className="w-14 h-14 mx-auto rounded-2xl shadow-xl shadow-blue-500/30 object-cover mb-3.5 border border-white/20"
          />

          <h2 className="text-2xl font-black tracking-tight">
            Dompet<span className="text-blue-400">Ku</span>
          </h2>
          <p className="text-xs text-blue-200/80 font-medium mt-1">
            Personal Expense Tracker & Multi-User Management
          </p>

          {/* Tab Selector */}
          <div className="mt-6 flex items-center p-1 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isLoginTab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginTab(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isLoginTab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Daftar Baru
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Name Field (Register only) */}
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {isLoginTab ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>
              {isLoading
                ? 'Memproses...'
                : isLoginTab
                ? 'Masuk ke DompetKu'
                : 'Buat Akun Sekarang'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 font-medium">
              atau
            </span>
          </div>

          {/* Guest Access Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Coba Cepat sebagai Tamu (Guest)</span>
          </button>
        </form>

        {/* Security badge footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Setiap akun memiliki data & anggaran terisolasi terpisah</span>
        </div>
      </div>
    </div>
  );
}
