import fs from 'fs';
import path from 'path';
import {
  AppState,
  Category,
  GoldSavings,
  GoldTransaction,
  MonthlyBudget,
  SavingsGoal,
  SavingsTransaction,
  Transaction,
  TransactionFilter,
} from './types';
import { DEFAULT_CATEGORIES, generateSampleTransactions } from './sample-data';
import { getCurrentMonthString } from './formatters';
import { hasSupabaseConfig, supabase } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'dompetku.json');

function getDefaultState(): AppState {
  return {
    categories: [],
    transactions: [],
    monthlyBudgets: {},
    savingsGoals: [],
    savingsTransactions: [],
    goldSavings: [],
    goldTransactions: [],
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

    if (!parsed.categories) parsed.categories = [];
    if (!parsed.transactions) parsed.transactions = [];
    if (!parsed.monthlyBudgets) parsed.monthlyBudgets = {};
    if (!parsed.savingsGoals) parsed.savingsGoals = [];
    if (!parsed.savingsTransactions) parsed.savingsTransactions = [];
    if (!parsed.goldSavings) parsed.goldSavings = [];
    if (!parsed.goldTransactions) parsed.goldTransactions = [];

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
    // Ignore on readonly serverless environments
  }
}

// TRANSACTIONS
export async function getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
  // 1. Try Supabase
  if (hasSupabaseConfig) {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (filter?.userId) {
        query = query.eq('user_id', filter.userId);
      }

      const { data, error } = await query;

      if (!error && Array.isArray(data)) {
        let list: Transaction[] = data.map((row) => ({
          id: row.id,
          userId: row.user_id,
          title: row.title,
          amount: Number(row.amount),
          type: (row.type as 'expense' | 'income') || 'expense',
          categoryId: row.category_id,
          date: typeof row.date === 'string' ? row.date.split('T')[0] : row.date,
          paymentMethod: row.payment_method,
          notes: row.notes || '',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        if (filter) {
          if (filter.type && filter.type !== 'all') {
            list = list.filter((t) => (t.type || 'expense') === filter.type);
          }
          if (filter.type && filter.type !== 'all') {
    list = list.filter((t) => (t.type || 'expense') === filter.type);
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
        }

        return list;
      }
    } catch (err) {
      // Fallback to local
    }
  }

  // 2. Fallback to Local Storage
  const state = ensureDataFile();
  let list = [...(state.transactions || [])];

  if (filter?.userId) {
    list = list.filter((t) => t.userId === filter.userId);
  } else {
    return [];
  }

  if (!filter) {
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  if (filter.type && filter.type !== 'all') {
    list = list.filter((t) => (t.type || 'expense') === filter.type);
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
          userId: data.user_id,
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
    type: payload.type || 'expense',
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  if (hasSupabaseConfig) {
    try {
      const { error } = await supabase.from('transactions').insert({
        id: newTx.id,
        user_id: newTx.userId || null,
        title: newTx.title,
        amount: newTx.amount,
        type: newTx.type || 'expense',
        category_id: newTx.categoryId,
        date: newTx.date,
        payment_method: newTx.paymentMethod,
        notes: newTx.notes || null,
        created_at: newTx.createdAt,
        updated_at: newTx.updatedAt,
      });

      // If schema in Supabase has no 'type' column yet, retry without type column
      if (error && error.message && error.message.toLowerCase().includes('type')) {
        await supabase.from('transactions').insert({
          id: newTx.id,
          user_id: newTx.userId || null,
          title: newTx.title,
          amount: newTx.amount,
          category_id: newTx.categoryId,
          date: newTx.date,
          payment_method: newTx.paymentMethod,
          notes: newTx.notes || null,
          created_at: newTx.createdAt,
          updated_at: newTx.updatedAt,
        });
      }
    } catch (e) {
      // fallback
    }
  }

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
      if (payload.type !== undefined) updatePayload.type = payload.type;
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
export async function getCategories(userId?: string): Promise<Category[]> {
  if (!userId) return [];

  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          id: row.id,
          userId: row.user_id,
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
  return (state.categories || []).filter((c) => c.userId === userId);
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
        user_id: newCat.userId || null,
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
export async function getMonthlyBudgets(userId?: string): Promise<Record<string, number>> {
  if (!userId) return {};

  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', userId);

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
  const budgetsMap: Record<string, number> = {};
  Object.entries(state.monthlyBudgets || {}).forEach(([k, v]) => {
    if (k.startsWith(`${userId}:`)) {
      budgetsMap[k.replace(`${userId}:`, '')] = v;
    }
  });

  return budgetsMap;
}

export async function setMonthlyBudget(
  monthYear: string,
  amount: number,
  userId?: string
): Promise<number> {
  const safeAmount = Math.max(0, amount);

  if (hasSupabaseConfig) {
    try {
      await supabase.from('monthly_budgets').upsert({
        month_year: monthYear,
        user_id: userId || null,
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
  const key = userId ? `${userId}:${monthYear}` : monthYear;
  state.monthlyBudgets[key] = safeAmount;
  saveData(state);
  return safeAmount;
}

// BACKUP & RESTORE
export async function getAppState(userId?: string): Promise<AppState> {
  const [categories, transactions, monthlyBudgets] = await Promise.all([
    getCategories(userId),
    getTransactions(userId ? { userId } : undefined),
    getMonthlyBudgets(userId),
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

export async function seedDemoData(userId?: string): Promise<AppState> {
  const sample = generateSampleTransactions();
  const currentMonth = getCurrentMonthString();
  const state = ensureDataFile();

  const newCategories: Category[] = [
    {
      id: `cat-makanan-${Date.now()}`,
      userId,
      name: 'Makanan & Minuman',
      icon: 'Utensils',
      color: '#F97316',
      budgetLimit: 1500000,
    },
    {
      id: `cat-transportasi-${Date.now()}`,
      userId,
      name: 'Transportasi',
      icon: 'Car',
      color: '#3B82F6',
      budgetLimit: 600000,
    },
    {
      id: `cat-belanja-${Date.now()}`,
      userId,
      name: 'Belanja',
      icon: 'ShoppingBag',
      color: '#EC4899',
      budgetLimit: 500000,
    },
  ];

  state.categories = [...state.categories, ...newCategories];
  saveData(state);
  return state;
}

export async function resetAllData(userId?: string): Promise<AppState> {
  const state = ensureDataFile();
  if (userId) {
    state.transactions = state.transactions.filter((t) => t.userId !== userId);
    state.categories = state.categories.filter((c) => c.userId !== userId);
    if (state.savingsGoals) state.savingsGoals = state.savingsGoals.filter((g) => g.userId !== userId);
    if (state.savingsTransactions) state.savingsTransactions = state.savingsTransactions.filter((s) => s.userId !== userId);
  } else {
    state.transactions = [];
    state.categories = [];
    state.monthlyBudgets = {};
    state.savingsGoals = [];
    state.savingsTransactions = [];
  }
  saveData(state);
  return state;
}

// -------------------------------------------------------------
// SAVINGS & GOALS (TABUNGAN & IMPIAN)
// -------------------------------------------------------------

export async function getSavingsGoals(userId?: string): Promise<SavingsGoal[]> {
  if (hasSupabaseConfig) {
    try {
      let query = supabase.from('savings_goals').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          id: row.id,
          userId: row.user_id,
          title: row.title,
          targetAmount: Number(row.target_amount) || 0,
          currentAmount: Number(row.current_amount) || 0,
          targetDate: row.target_date || undefined,
          color: row.color || '#10B981',
          icon: row.icon || 'PiggyBank',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  const list = state.savingsGoals || [];
  if (userId) {
    return list.filter((g) => g.userId === userId || !g.userId);
  }
  return list;
}

export async function saveSavingsGoal(goal: SavingsGoal): Promise<SavingsGoal> {
  const now = new Date().toISOString();
  const toSave: SavingsGoal = {
    ...goal,
    id: goal.id || `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: goal.createdAt || now,
    updatedAt: now,
  };

  if (hasSupabaseConfig) {
    try {
      await supabase.from('savings_goals').upsert({
        id: toSave.id,
        user_id: toSave.userId || null,
        title: toSave.title,
        target_amount: toSave.targetAmount,
        current_amount: toSave.currentAmount,
        target_date: toSave.targetDate || null,
        color: toSave.color,
        icon: toSave.icon,
        updated_at: toSave.updatedAt,
      });
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  if (!state.savingsGoals) state.savingsGoals = [];
  const idx = state.savingsGoals.findIndex((g) => g.id === toSave.id);
  if (idx >= 0) {
    state.savingsGoals[idx] = toSave;
  } else {
    state.savingsGoals.unshift(toSave);
  }
  saveData(state);
  return toSave;
}

export async function deleteSavingsGoal(id: string, userId?: string): Promise<boolean> {
  if (hasSupabaseConfig) {
    try {
      await supabase.from('savings_goals').delete().eq('id', id);
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  if (state.savingsGoals) {
    state.savingsGoals = state.savingsGoals.filter((g) => g.id !== id);
    saveData(state);
  }
  return true;
}

export async function getSavingsTransactions(userId?: string): Promise<SavingsTransaction[]> {
  if (hasSupabaseConfig) {
    try {
      let query = supabase.from('savings_transactions').select('*').order('date', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          id: row.id,
          userId: row.user_id,
          goalId: row.goal_id || undefined,
          goalTitle: row.goal_title || undefined,
          type: row.type as 'deposit' | 'withdraw',
          amount: Number(row.amount) || 0,
          date: typeof row.date === 'string' ? row.date.split('T')[0] : row.date,
          notes: row.notes || '',
          createdAt: row.created_at,
        }));
      }
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  const list = state.savingsTransactions || [];
  if (userId) {
    return list.filter((s) => s.userId === userId || !s.userId);
  }
  return list;
}

export async function saveSavingsTransaction(tx: SavingsTransaction): Promise<SavingsTransaction> {
  const now = new Date().toISOString();
  const toSave: SavingsTransaction = {
    ...tx,
    id: tx.id || `sav-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: tx.createdAt || now,
  };

  if (hasSupabaseConfig) {
    try {
      await supabase.from('savings_transactions').upsert({
        id: toSave.id,
        user_id: toSave.userId || null,
        goal_id: toSave.goalId || null,
        goal_title: toSave.goalTitle || null,
        type: toSave.type,
        amount: toSave.amount,
        date: toSave.date,
        notes: toSave.notes || null,
        created_at: toSave.createdAt,
      });
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  if (!state.savingsTransactions) state.savingsTransactions = [];
  const idx = state.savingsTransactions.findIndex((s) => s.id === toSave.id);
  if (idx >= 0) {
    state.savingsTransactions[idx] = toSave;
  } else {
    state.savingsTransactions.unshift(toSave);
  }

  // Update target goal currentAmount if linked
  if (toSave.goalId && state.savingsGoals) {
    const goal = state.savingsGoals.find((g) => g.id === toSave.goalId);
    if (goal) {
      const delta = toSave.type === 'deposit' ? toSave.amount : -toSave.amount;
      goal.currentAmount = Math.max(0, (goal.currentAmount || 0) + delta);
      goal.updatedAt = now;
      if (hasSupabaseConfig) {
        try {
          await supabase.from('savings_goals').update({ current_amount: goal.currentAmount }).eq('id', goal.id);
        } catch (e) {}
      }
    }
  }

  saveData(state);
  return toSave;
}

export async function deleteSavingsTransaction(id: string, userId?: string): Promise<boolean> {
  if (hasSupabaseConfig) {
    try {
      await supabase.from('savings_transactions').delete().eq('id', id);
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  if (state.savingsTransactions) {
    const found = state.savingsTransactions.find((s) => s.id === id);
    if (found && found.goalId && state.savingsGoals) {
      const goal = state.savingsGoals.find((g) => g.id === found.goalId);
      if (goal) {
        // Reverse the effect
        const rev = found.type === 'deposit' ? -found.amount : found.amount;
        goal.currentAmount = Math.max(0, (goal.currentAmount || 0) + rev);
        if (hasSupabaseConfig) {
          try {
            await supabase.from('savings_goals').update({ current_amount: goal.currentAmount }).eq('id', goal.id);
          } catch (e) {}
        }
      }
    }
    state.savingsTransactions = state.savingsTransactions.filter((s) => s.id !== id);
    saveData(state);
  }
  return true;
}

// -------------------------------------------------------------
// TABUNGAN EMAS (GOLD SAVINGS & LOGAM MULIA)
// -------------------------------------------------------------

export async function getGoldSavings(userId?: string): Promise<GoldSavings[]> {
  if (hasSupabaseConfig) {
    try {
      let query = supabase.from('gold_savings').select('*').order('purchase_date', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          id: row.id,
          userId: row.user_id,
          type: row.type,
          karat: row.karat || '24K',
          jewelryType: row.jewelry_type || undefined,
          itemName: row.item_name || undefined,
          storeName: row.store_name || undefined,
          weightGrams: Number(row.weight_grams) || 0,
          purchasePrice: Number(row.purchase_price) || 0,
          pricePerGram: Number(row.price_per_gram) || 0,
          currentEstimatedPricePerGram: Number(row.current_estimated_price_per_gram) || undefined,
          purchaseDate: typeof row.purchase_date === 'string' ? row.purchase_date.split('T')[0] : row.purchase_date,
          storageLocation: row.storage_location || '',
          serialNumber: row.serial_number || '',
          notes: row.notes || '',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  const list = state.goldSavings || [];
  if (userId) {
    return list.filter((g) => g.userId === userId || !g.userId);
  }
  return list;
}

export async function saveGoldSavings(item: GoldSavings): Promise<GoldSavings> {
  const now = new Date().toISOString();
  const pricePerGram =
    item.pricePerGram > 0
      ? item.pricePerGram
      : item.weightGrams > 0
      ? Math.round(item.purchasePrice / item.weightGrams)
      : 0;

  const toSave: GoldSavings = {
    ...item,
    id: item.id || `gold-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    pricePerGram,
    createdAt: item.createdAt || now,
    updatedAt: now,
  };

  if (hasSupabaseConfig) {
    try {
      await supabase.from('gold_savings').upsert({
        id: toSave.id,
        user_id: toSave.userId || null,
        type: toSave.type,
        karat: toSave.karat,
        jewelry_type: toSave.jewelryType || null,
        item_name: toSave.itemName || null,
        store_name: toSave.storeName || null,
        weight_grams: toSave.weightGrams,
        purchase_price: toSave.purchasePrice,
        price_per_gram: toSave.pricePerGram,
        current_estimated_price_per_gram: toSave.currentEstimatedPricePerGram || null,
        purchase_date: toSave.purchaseDate,
        storage_location: toSave.storageLocation || null,
        serial_number: toSave.serialNumber || null,
        notes: toSave.notes || null,
        updated_at: toSave.updatedAt,
      });
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  if (!state.goldSavings) state.goldSavings = [];
  const idx = state.goldSavings.findIndex((g) => g.id === toSave.id);
  if (idx >= 0) {
    state.goldSavings[idx] = toSave;
  } else {
    state.goldSavings.unshift(toSave);
  }
  saveData(state);
  return toSave;
}

export async function deleteGoldSavings(id: string, userId?: string): Promise<boolean> {
  if (hasSupabaseConfig) {
    try {
      await supabase.from('gold_savings').delete().eq('id', id);
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  if (state.goldSavings) {
    state.goldSavings = state.goldSavings.filter((g) => g.id !== id);
    saveData(state);
  }
  return true;
}

export async function getGoldTransactions(userId?: string): Promise<GoldTransaction[]> {
  if (hasSupabaseConfig) {
    try {
      let query = supabase.from('gold_transactions').select('*').order('date', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          id: row.id,
          userId: row.user_id,
          goldId: row.gold_id || undefined,
          type: row.type as 'buy' | 'sell',
          goldType: row.gold_type,
          karat: row.karat,
          weightGrams: Number(row.weight_grams) || 0,
          totalPrice: Number(row.total_price) || 0,
          date: typeof row.date === 'string' ? row.date.split('T')[0] : row.date,
          notes: row.notes || '',
          createdAt: row.created_at,
        }));
      }
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  const list = state.goldTransactions || [];
  if (userId) {
    return list.filter((g) => g.userId === userId || !g.userId);
  }
  return list;
}

export async function saveGoldTransaction(tx: GoldTransaction): Promise<GoldTransaction> {
  const now = new Date().toISOString();
  const toSave: GoldTransaction = {
    ...tx,
    id: tx.id || `gtx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: tx.createdAt || now,
  };

  if (hasSupabaseConfig) {
    try {
      await supabase.from('gold_transactions').upsert({
        id: toSave.id,
        user_id: toSave.userId || null,
        gold_id: toSave.goldId || null,
        type: toSave.type,
        gold_type: toSave.goldType,
        karat: toSave.karat,
        weight_grams: toSave.weightGrams,
        total_price: toSave.totalPrice,
        date: toSave.date,
        notes: toSave.notes || null,
        created_at: toSave.createdAt,
      });
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  if (!state.goldTransactions) state.goldTransactions = [];
  const idx = state.goldTransactions.findIndex((g) => g.id === toSave.id);
  if (idx >= 0) {
    state.goldTransactions[idx] = toSave;
  } else {
    state.goldTransactions.unshift(toSave);
  }
  saveData(state);
  return toSave;
}

export async function deleteGoldTransaction(id: string, userId?: string): Promise<boolean> {
  if (hasSupabaseConfig) {
    try {
      await supabase.from('gold_transactions').delete().eq('id', id);
    } catch (e) {
      // fallback
    }
  }

  const state = ensureDataFile();
  if (state.goldTransactions) {
    state.goldTransactions = state.goldTransactions.filter((g) => g.id !== id);
    saveData(state);
  }
  return true;
}
