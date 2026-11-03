import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { User } from '@/lib/types';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

interface StoredUser extends User {
  passwordHash: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf-8');
      return [];
    }
    const content = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(content) as StoredUser[];
  } catch (e) {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    // ignore on readonly
  }
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'dompetku_salt_2026').digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    // 1. REGISTER
    if (action === 'register') {
      const { name, email, password } = body;

      if (!name || name.trim() === '') {
        return NextResponse.json({ success: false, message: 'Nama lengkap wajib diisi!' }, { status: 400 });
      }
      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Format email tidak valid!' }, { status: 400 });
      }
      if (!password || password.length < 6) {
        return NextResponse.json(
          { success: false, message: 'Kata sandi minimal 6 karakter!' },
          { status: 400 }
        );
      }

      const cleanEmail = email.toLowerCase().trim();
      const users = getStoredUsers();

      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return NextResponse.json(
          { success: false, message: 'Email sudah terdaftar. Silakan login!' },
          { status: 400 }
        );
      }

      const newUser: StoredUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        email: cleanEmail,
        createdAt: new Date().toISOString(),
        passwordHash: hashPassword(password),
      };

      users.push(newUser);
      saveStoredUsers(users);

      const safeUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      };

      return NextResponse.json({
        success: true,
        message: 'Pendaftaran akun berhasil!',
        data: safeUser,
      });
    }

    // 2. LOGIN
    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email dan kata sandi wajib diisi!' },
          { status: 400 }
        );
      }

      const cleanEmail = email.toLowerCase().trim();
      const users = getStoredUsers();
      const pHash = hashPassword(password);

      const found = users.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === pHash
      );

      if (!found) {
        return NextResponse.json(
          { success: false, message: 'Email atau kata sandi tidak cocok!' },
          { status: 401 }
        );
      }

      const safeUser: User = {
        id: found.id,
        name: found.name,
        email: found.email,
        createdAt: found.createdAt,
      };

      return NextResponse.json({
        success: true,
        message: 'Login berhasil!',
        data: safeUser,
      });
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak dikenal' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem autentikasi' },
      { status: 500 }
    );
  }
}
