import fs from 'fs';
import path from 'path';
import { AppState, Category, MonthlyBudget, Transaction, TransactionFilter } from './types';
import { DEFAULT_CATEGORIES, generateSampleTransactions } from './sample-data';
import { getCurrentMonthString } from './formatters';
import { hasSupabaseConfig, supabase } from './supabase';

// Path for local persistent JSON database
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'dompetku.json');

function getDefaultState(): AppState {
  const currentMonth = getCurrentMonthString();
  return {
    categories: DEFAULT_CATEGORIES,
    transactions: generateSampleTransactions(),
    monthlyBudgets: {
      [currentMonth]: 3500000,
    },
  };
}

function ensureDataFile(): AppState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
      const defaultState = getDefaultState();
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState, null, 2), 'utf-8');
      return defaultState;
    }

    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content) as AppState;

    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = DEFAULT_CATEGORIES;
    }
    if (!parsed.transactions) {
      parsed.transactions = [];
    }
    if (!parsed.monthlyBudgets) {
      parsed.monthlyBudgets = {};
    }

    return parsed;
  } catch (error) {
    return getDefaultState();
  }
}

function saveData(state: AppState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    // If running on readonly filesystem (e.g. Vercel lambda), ignore write error
  }
}

// TRANSACTIONS
export async function getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
  // 1. Try Supabase
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!error && Array.isArray(data)) {
        let list: Transaction[] = data.map((row) => ({
          id: row.id,
          title: row.title,
          amount: Number(row.amount),
          categoryId: row.category_id,
          date: typeof row.date === 'string' ? row.date.split('T')[0] : row.date,
          paymentMethod: row.payment_method,
          notes: row.notes || '',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        if (filter) {
          if (filter.search && filter.search.trim() !== '') {
            const q = filter.search.toLowerCase().trim();
            list = list.filter(
              (t) =>
                t.title.toLowerCase().includes(q) ||
                (t.notes && t.notes.toLowerCase().includes(q))
            );
          }
          if (filter.categoryId && filter.categoryId !== 'all') {
            list = list.filter((t) => t.categoryId === filter.categoryId);
          }
          if (filter.paymentMethod && filter.paymentMethod !== 'all') {
            list = list.filter((t) => t.paymentMethod === filter.paymentMethod);
          }
          if (filter.month && filter.month !== 'all') {
            list = list.filter((t) => t.date.startsWith(filter.month!));
          }
          if (filter.startDate) {
            list = list.filter((t) => t.date >= filter.startDate!);
          }
          if (filter.endDate) {
            list = list.filter((t) => t.date <= filter.endDate!);
          }
          if (filter.sortBy === 'date-asc') {
            list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          } else if (filter.sortBy === 'amount-desc') {
            list.sort((a, b) => b.amount - a.amount);
          } else if (filter.sortBy === 'amount-asc') {
            list.sort((a, b) => a.amount - b.amount);
          } else {
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          }
        }

        return list;
      }
    } catch (err) {
      // Fall through to local storage
    }
  }

  // 2. Fallback to Local Storage
  const state = ensureDataFile();
  let list = [...state.transactions];

  if (!filter) {
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  if (filter.search && filter.search.trim() !== '') {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
    );
  }
  if (filter.categoryId && filter.categoryId !== 'all') {
    list = list.filter((t) => t.categoryId === filter.categoryId);
  }
  if (filter.paymentMethod && filter.paymentMethod !== 'all') {
    list = list.filter((t) => t.paymentMethod === filter.paymentMethod);
  }
  if (filter.month && filter.month !== 'all') {
    list = list.filter((t) => t.date.startsWith(filter.month!));
  }
  if (filter.startDate) {
    list = list.filter((t) => t.date >= filter.startDate!);
  }
  if (filter.endDate) {
    list = list.filter((t) => t.date <= filter.endDate!);
  }
  if (filter.sortBy === 'date-asc') {
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (filter.sortBy === 'amount-desc') {
    list.sort((a, b) => b.amount - a.amount);
  } else if (filter.sortBy === 'amount-asc') {
    list.sort((a, b) => a.amount - b.amount);
  } else {
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return list;
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          amount: Number(data.amount),
          categoryId: data.category_id,
          date: typeof data.date === 'string' ? data.date.split('T')[0] : data.date,
          paymentMethod: data.payment_method,
          notes: data.notes || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  return state.transactions.find((t) => t.id === id) || null;
}

export async function createTransaction(
  payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Transaction> {
  const now = new Date().toISOString();
  const newTx: Transaction = {
    ...payload,
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  // Try insert to Supabase
  if (hasSupabaseConfig) {
    try {
      await supabase.from('transactions').insert({
        id: newTx.id,
        title: newTx.title,
        amount: newTx.amount,
        category_id: newTx.categoryId,
        date: newTx.date,
        payment_method: newTx.paymentMethod,
        notes: newTx.notes || null,
        created_at: newTx.createdAt,
        updated_at: newTx.updatedAt,
      });
    } catch (e) {
      // Ignore error if fallback works
    }
  }

  // Also keep local copy
  const state = ensureDataFile();
  state.transactions.unshift(newTx);
  saveData(state);

  return newTx;
}

export async function updateTransaction(
  id: string,
  payload: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Transaction | null> {
  const now = new Date().toISOString();

  if (hasSupabaseConfig) {
    try {
      const updatePayload: Record<string, any> = { updated_at: now };
      if (payload.title !== undefined) updatePayload.title = payload.title;
      if (payload.amount !== undefined) updatePayload.amount = payload.amount;
      if (payload.categoryId !== undefined) updatePayload.category_id = payload.categoryId;
      if (payload.date !== undefined) updatePayload.date = payload.date;
      if (payload.paymentMethod !== undefined) updatePayload.payment_method = payload.paymentMethod;
      if (payload.notes !== undefined) updatePayload.notes = payload.notes;

      await supabase.from('transactions').update(updatePayload).eq('id', id);
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  const index = state.transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated: Transaction = {
    ...state.transactions[index],
    ...payload,
    updatedAt: now,
  };

  state.transactions[index] = updated;
  saveData(state);
  return updated;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  if (hasSupabaseConfig) {
    try {
      await supabase.from('transactions').delete().eq('id', id);
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  const initialLength = state.transactions.length;
  state.transactions = state.transactions.filter((t) => t.id !== id);

  if (state.transactions.length !== initialLength) {
    saveData(state);
    return true;
  }
  return false;
}

// CATEGORIES
export async function getCategories(): Promise<Category[]> {
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          name: row.name,
          icon: row.icon || 'Tag',
          color: row.color || '#3B82F6',
          budgetLimit: Number(row.budget_limit) || 0,
          isDefault: Boolean(row.is_default),
        }));
      }
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  return state.categories;
}

export async function createCategory(payload: Omit<Category, 'id'>): Promise<Category> {
  const newCat: Category = {
    ...payload,
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  if (hasSupabaseConfig) {
    try {
      await supabase.from('categories').insert({
        id: newCat.id,
        name: newCat.name,
        icon: newCat.icon,
        color: newCat.color,
        budget_limit: newCat.budgetLimit,
        is_default: Boolean(newCat.isDefault),
      });
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  state.categories.push(newCat);
  saveData(state);
  return newCat;
}

export async function updateCategory(
  id: string,
  payload: Partial<Omit<Category, 'id'>>
): Promise<Category | null> {
  if (hasSupabaseConfig) {
    try {
      const updateData: Record<string, any> = {};
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.icon !== undefined) updateData.icon = payload.icon;
      if (payload.color !== undefined) updateData.color = payload.color;
      if (payload.budgetLimit !== undefined) updateData.budget_limit = payload.budgetLimit;

      await supabase.from('categories').update(updateData).eq('id', id);
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  const index = state.categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updated: Category = {
    ...state.categories[index],
    ...payload,
  };

  state.categories[index] = updated;
  saveData(state);
  return updated;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
  const state = ensureDataFile();
  const used = state.transactions.some((t) => t.categoryId === id);
  if (used) {
    return {
      success: false,
      message: 'Kategori ini tidak dapat dihapus karena masih digunakan dalam transaksi!',
    };
  }

  if (hasSupabaseConfig) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (e) {
      // fallback
    }
  }

  state.categories = state.categories.filter((c) => c.id !== id);
  saveData(state);
  return { success: true };
}

// BUDGETS
export async function getMonthlyBudgets(): Promise<Record<string, number>> {
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase.from('monthly_budgets').select('*');
      if (!error && Array.isArray(data)) {
        const budgetsMap: Record<string, number> = {};
        data.forEach((row) => {
          budgetsMap[row.month_year] = Number(row.amount);
        });
        return budgetsMap;
      }
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  return state.monthlyBudgets || {};
}

export async function setMonthlyBudget(monthYear: string, amount: number): Promise<number> {
  const safeAmount = Math.max(0, amount);

  if (hasSupabaseConfig) {
    try {
      await supabase.from('monthly_budgets').upsert({
        month_year: monthYear,
        amount: safeAmount,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  if (!state.monthlyBudgets) {
    state.monthlyBudgets = {};
  }
  state.monthlyBudgets[monthYear] = safeAmount;
  saveData(state);
  return safeAmount;
}

// BACKUP & RESTORE
export async function getAppState(): Promise<AppState> {
  const [categories, transactions, monthlyBudgets] = await Promise.all([
    getCategories(),
    getTransactions(),
    getMonthlyBudgets(),
  ]);

  return { categories, transactions, monthlyBudgets };
}

export async function restoreAppState(newState: AppState): Promise<boolean> {
  if (!newState || !Array.isArray(newState.categories) || !Array.isArray(newState.transactions)) {
    throw new Error('Format data backup tidak valid!');
  }
  saveData(newState);
  return true;
}

export async function seedDemoData(): Promise<AppState> {
  const defaultState = getDefaultState();
  saveData(defaultState);
  return defaultState;
}

export async function resetAllData(): Promise<AppState> {
  const currentMonth = getCurrentMonthString();
  const cleanState: AppState = {
    categories: DEFAULT_CATEGORIES,
    transactions: [],
    monthlyBudgets: {
      [currentMonth]: 0,
    },
  };
  saveData(cleanState);
  return cleanState;
}
