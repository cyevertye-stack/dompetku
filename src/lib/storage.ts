import fs from 'fs';
import path from 'path';
import { AppState, Category, MonthlyBudget, Transaction, TransactionFilter } from './types';
import { DEFAULT_CATEGORIES, generateSampleTransactions } from './sample-data';
import { getCurrentMonthString } from './formatters';

// Path for local persistent JSON database
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'dompetku.json');

function getDefaultState(): AppState {
  const currentMonth = getCurrentMonthString();
  return {
    categories: DEFAULT_CATEGORIES,
    transactions: generateSampleTransactions(),
    monthlyBudgets: {
      [currentMonth]: 3500000, // Rp 3.500.000 default budget for current month
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

    // Ensure categories exists
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
    console.error('Error reading data file, using default state:', error);
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
    console.error('Error writing data file:', error);
  }
}

// TRANSACTIONS
export async function getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
  const state = ensureDataFile();
  let list = [...state.transactions];

  if (!filter) {
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Filter Search
  if (filter.search && filter.search.trim() !== '') {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
    );
  }

  // Filter Category
  if (filter.categoryId && filter.categoryId !== 'all') {
    list = list.filter((t) => t.categoryId === filter.categoryId);
  }

  // Filter Payment Method
  if (filter.paymentMethod && filter.paymentMethod !== 'all') {
    list = list.filter((t) => t.paymentMethod === filter.paymentMethod);
  }

  // Filter Month
  if (filter.month && filter.month !== 'all') {
    list = list.filter((t) => t.date.startsWith(filter.month!));
  }

  // Filter Date Range
  if (filter.startDate) {
    list = list.filter((t) => t.date >= filter.startDate!);
  }
  if (filter.endDate) {
    list = list.filter((t) => t.date <= filter.endDate!);
  }

  // Sorting
  if (filter.sortBy === 'date-asc') {
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (filter.sortBy === 'amount-desc') {
    list.sort((a, b) => b.amount - a.amount);
  } else if (filter.sortBy === 'amount-asc') {
    list.sort((a, b) => a.amount - b.amount);
  } else {
    // default date-desc
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return list;
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const state = ensureDataFile();
  return state.transactions.find((t) => t.id === id) || null;
}

export async function createTransaction(
  payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Transaction> {
  const state = ensureDataFile();
  const now = new Date().toISOString();
  const newTx: Transaction = {
    ...payload,
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  state.transactions.unshift(newTx);
  saveData(state);
  return newTx;
}

export async function updateTransaction(
  id: string,
  payload: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Transaction | null> {
  const state = ensureDataFile();
  const index = state.transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated: Transaction = {
    ...state.transactions[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  state.transactions[index] = updated;
  saveData(state);
  return updated;
}

export async function deleteTransaction(id: string): Promise<boolean> {
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
  const state = ensureDataFile();
  return state.categories;
}

export async function createCategory(
  payload: Omit<Category, 'id'>
): Promise<Category> {
  const state = ensureDataFile();
  const newCat: Category = {
    ...payload,
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  state.categories.push(newCat);
  saveData(state);
  return newCat;
}

export async function updateCategory(
  id: string,
  payload: Partial<Omit<Category, 'id'>>
): Promise<Category | null> {
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
  // Check if any transaction uses this category
  const used = state.transactions.some((t) => t.categoryId === id);
  if (used) {
    return {
      success: false,
      message: 'Kategori ini tidak dapat dihapus karena masih digunakan dalam transaksi!',
    };
  }

  state.categories = state.categories.filter((c) => c.id !== id);
  saveData(state);
  return { success: true };
}

// BUDGETS
export async function getMonthlyBudgets(): Promise<Record<string, number>> {
  const state = ensureDataFile();
  return state.monthlyBudgets || {};
}

export async function setMonthlyBudget(monthYear: string, amount: number): Promise<number> {
  const state = ensureDataFile();
  if (!state.monthlyBudgets) {
    state.monthlyBudgets = {};
  }
  state.monthlyBudgets[monthYear] = Math.max(0, amount);
  saveData(state);
  return state.monthlyBudgets[monthYear];
}

// BACKUP & RESTORE & SEED
export async function getAppState(): Promise<AppState> {
  return ensureDataFile();
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
