import { Category, Transaction } from './types';

// Default is empty as requested: users create their own categories and budgets
export const DEFAULT_CATEGORIES: Category[] = [];

// Optional template categories if user wants 1-click preset later
export const TEMPLATE_CATEGORIES: Omit<Category, 'id'>[] = [
  {
    name: 'Makanan & Minuman',
    icon: 'Utensils',
    color: '#F97316',
    budgetLimit: 1500000,
  },
  {
    name: 'Transportasi',
    icon: 'Car',
    color: '#3B82F6',
    budgetLimit: 600000,
  },
  {
    name: 'Kebutuhan Kuliah',
    icon: 'GraduationCap',
    color: '#8B5CF6',
    budgetLimit: 800000,
  },
  {
    name: 'Belanja',
    icon: 'ShoppingBag',
    color: '#EC4899',
    budgetLimit: 500000,
  },
  {
    name: 'Hiburan',
    icon: 'Film',
    color: '#EAB308',
    budgetLimit: 400000,
  },
  {
    name: 'Tagihan & Utilitas',
    icon: 'Receipt',
    color: '#EF4444',
    budgetLimit: 750000,
  },
  {
    name: 'Kesehatan',
    icon: 'HeartPulse',
    color: '#10B981',
    budgetLimit: 300000,
  },
  {
    name: 'Kebutuhan Pribadi',
    icon: 'User',
    color: '#06B6D4',
    budgetLimit: 450000,
  },
  {
    name: 'Lain-lain',
    icon: 'MoreHorizontal',
    color: '#6B7280',
    budgetLimit: 250000,
  },
];

export function generateSampleTransactions(): Transaction[] {
  return [];
}
