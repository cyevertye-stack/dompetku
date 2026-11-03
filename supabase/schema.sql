-- Skema Database Supabase Lengkap untuk DompetKu – Personal Expense, Savings & Gold Tracker
-- Jalankan skrip SQL ini di Supabase: Dashboard -> SQL Editor -> New Query -> Run

-- 1. Tabel Users (Akun Pengguna)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Kategori (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Tag',
    color TEXT DEFAULT '#3B82F6',
    budget_limit NUMERIC DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Transaksi Pengeluaran (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    payment_method TEXT DEFAULT 'Tunai',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Anggaran Bulanan (monthly_budgets)
CREATE TABLE IF NOT EXISTS public.monthly_budgets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- Format 'YYYY-MM'
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_month UNIQUE (user_id, month_year)
);

-- 5. Tabel Target Impian Tabungan (savings_goals)
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    color TEXT DEFAULT '#10B981',
    icon TEXT DEFAULT 'PiggyBank',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabel Mutasi Uang Ditabung (savings_transactions)
CREATE TABLE IF NOT EXISTS public.savings_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    goal_id TEXT REFERENCES public.savings_goals(id) ON DELETE SET NULL,
    goal_title TEXT,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabel Tabungan Emas & Logam Mulia (gold_savings)
CREATE TABLE IF NOT EXISTS public.gold_savings (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'Antam', 'UBS', 'Galeri 24', 'Emas Digital', 'Perhiasan', dll
    karat TEXT NOT NULL DEFAULT '24K', -- '24K', '22K', '18K', dll
    weight_grams NUMERIC NOT NULL CHECK (weight_grams > 0),
    purchase_price NUMERIC NOT NULL CHECK (purchase_price > 0),
    price_per_gram NUMERIC NOT NULL CHECK (price_per_gram > 0),
    current_estimated_price_per_gram NUMERIC,
    purchase_date DATE NOT NULL,
    storage_location TEXT,
    serial_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabel Transaksi Emas (gold_transactions)
CREATE TABLE IF NOT EXISTS public.gold_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    gold_id TEXT REFERENCES public.gold_savings(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
    gold_type TEXT NOT NULL,
    karat TEXT NOT NULL,
    weight_grams NUMERIC NOT NULL CHECK (weight_grams > 0),
    total_price NUMERIC NOT NULL CHECK (total_price > 0),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Aktifkan Row Level Security (RLS) dan Izinkan Akses Anon/Public
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for users" ON public.users;
CREATE POLICY "Public access for users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for categories" ON public.categories;
CREATE POLICY "Public access for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for transactions" ON public.transactions;
CREATE POLICY "Public access for transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for monthly_budgets" ON public.monthly_budgets;
CREATE POLICY "Public access for monthly_budgets" ON public.monthly_budgets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for savings_goals" ON public.savings_goals;
CREATE POLICY "Public access for savings_goals" ON public.savings_goals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for savings_transactions" ON public.savings_transactions;
CREATE POLICY "Public access for savings_transactions" ON public.savings_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for gold_savings" ON public.gold_savings;
CREATE POLICY "Public access for gold_savings" ON public.gold_savings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for gold_transactions" ON public.gold_transactions;
CREATE POLICY "Public access for gold_transactions" ON public.gold_transactions FOR ALL USING (true) WITH CHECK (true);
