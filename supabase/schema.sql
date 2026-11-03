-- Skema Database Supabase untuk DompetKu – Personal Expense Tracker
-- Jalankan skrip SQL ini di Supabase: Dashboard -> SQL Editor -> New Query -> Run

-- 1. Tabel Kategori (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT 'Tag',
    color TEXT DEFAULT '#3B82F6',
    budget_limit NUMERIC DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Transaksi Pengeluaran (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    payment_method TEXT DEFAULT 'Tunai',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Anggaran Bulanan (monthly_budgets)
CREATE TABLE IF NOT EXISTS public.monthly_budgets (
    month_year TEXT PRIMARY KEY, -- Format 'YYYY-MM'
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Aktifkan Row Level Security (RLS) dan Izinkan Akses Anon/Public
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for categories" ON public.categories;
CREATE POLICY "Public access for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for transactions" ON public.transactions;
CREATE POLICY "Public access for transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for monthly_budgets" ON public.monthly_budgets;
CREATE POLICY "Public access for monthly_budgets" ON public.monthly_budgets FOR ALL USING (true) WITH CHECK (true);

-- 5. Masukkan Kategori Default Bawaan
INSERT INTO public.categories (id, name, icon, color, budget_limit, is_default)
VALUES 
    ('cat-makanan', 'Makanan & Minuman', 'Utensils', '#F97316', 1500000, true),
    ('cat-transportasi', 'Transportasi', 'Car', '#3B82F6', 600000, true),
    ('cat-kuliah', 'Kebutuhan Kuliah', 'GraduationCap', '#8B5CF6', 800000, true),
    ('cat-belanja', 'Belanja', 'ShoppingBag', '#EC4899', 500000, true),
    ('cat-hiburan', 'Hiburan', 'Film', '#EAB308', 400000, true),
    ('cat-tagihan', 'Tagihan & Utilitas', 'Receipt', '#EF4444', 750000, true),
    ('cat-kesehatan', 'Kesehatan', 'HeartPulse', '#10B981', 300000, true),
    ('cat-pribadi', 'Kebutuhan Pribadi', 'User', '#06B6D4', 450000, true),
    ('cat-lainnya', 'Lain-lain', 'MoreHorizontal', '#6B7280', 250000, true)
ON CONFLICT (id) DO NOTHING;
