'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Category, Transaction } from '@/lib/types';
import {
  formatDateIndonesian,
  formatMonthIndonesian,
  formatRupiah,
  getCurrentMonthString,
  getPreviousMonthString,
} from '@/lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';

interface ReportOverviewProps {
  transactions: Transaction[];
  categories: Category[];
  monthlyBudgets: Record<string, number>;
  onExportExcel: (filterParams: {
    periodLabel: string;
    month?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  isExporting: boolean;
  currentMonth: string;
}

type PeriodType = 'this-month' | 'last-month' | 'this-year' | 'custom';

export function ReportOverview({
  transactions,
  categories,
  monthlyBudgets,
  onExportExcel,
  isExporting,
  currentMonth,
}: ReportOverviewProps) {
  const lastMonth = useMemo(() => getPreviousMonthString(currentMonth), [currentMonth]);
  const currentYear = useMemo(() => currentMonth.split('-')[0] || '2026', [currentMonth]);

  const [periodType, setPeriodType] = useState<PeriodType>('this-month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtered transactions based on chosen period
  const { filteredTxs, periodLabel, daysCount } = useMemo(() => {
    let txs: Transaction[] = [];
    let label = '';
    let days = 30;

    if (periodType === 'this-month') {
      txs = transactions.filter((t) => t.date.startsWith(currentMonth));
      label = `Bulan ${formatMonthIndonesian(currentMonth)}`;
      const [y, m] = currentMonth.split('-').map(Number);
      days = new Date(y, m, 0).getDate();
    } else if (periodType === 'last-month') {
      txs = transactions.filter((t) => t.date.startsWith(lastMonth));
      label = `Bulan ${formatMonthIndonesian(lastMonth)}`;
      const [y, m] = lastMonth.split('-').map(Number);
      days = new Date(y, m, 0).getDate();
    } else if (periodType === 'this-year') {
      txs = transactions.filter((t) => t.date.startsWith(currentYear));
      label = `Tahun ${currentYear}`;
      days = 365;
    } else if (periodType === 'custom') {
      txs = transactions.filter((t) => {
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
        return true;
      });

      if (startDate && endDate) {
        label = `${formatDateIndonesian(startDate)} s/d ${formatDateIndonesian(endDate)}`;
        const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
        days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
      } else if (startDate) {
        label = `Mulai ${formatDateIndonesian(startDate)}`;
      } else if (endDate) {
        label = `Hingga ${formatDateIndonesian(endDate)}`;
      } else {
        label = 'Semua Periode';
      }
    }

    return { filteredTxs: txs, periodLabel: label, daysCount: days };
  }, [periodType, currentMonth, lastMonth, currentYear, startDate, endDate, transactions]);

  // Calculations
  const totalExpense = filteredTxs.reduce((sum, t) => sum + t.amount, 0);
  const dailyAverage = daysCount > 0 ? totalExpense / daysCount : 0;
  const largestExpense = filteredTxs.reduce(
    (max, t) => (t.amount > max ? t.amount : max),
    0
  );

  // Category breakdown
  const categoryStats = useMemo(() => {
    return categories
      .map((cat) => {
        const catTxs = filteredTxs.filter((t) => t.categoryId === cat.id);
        const amount = catTxs.reduce((sum, t) => sum + t.amount, 0);
        const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return {
          cat,
          count: catTxs.length,
          amount,
          percent,
        };
      })
      .filter((s) => s.count > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [categories, filteredTxs, totalExpense]);

  // Payment method breakdown
  const paymentMethodStats = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTxs.forEach((t) => {
      map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([method, amount]) => ({
        method,
        amount,
        percent: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTxs, totalExpense]);

  const handleExport = () => {
    onExportExcel({
      periodLabel,
      month:
        periodType === 'this-month'
          ? currentMonth
          : periodType === 'last-month'
          ? lastMonth
          : undefined,
      startDate: periodType === 'custom' ? startDate : undefined,
      endDate: periodType === 'custom' ? endDate : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Card: Period Filter & Excel Export Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPeriodType('this-month')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodType === 'this-month'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriodType('last-month')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodType === 'last-month'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bulan Lalu
          </button>
          <button
            onClick={() => setPeriodType('this-year')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodType === 'this-year'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tahun Ini
          </button>
          <button
            onClick={() => setPeriodType('custom')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodType === 'custom'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rentang Kustom
          </button>
        </div>

        {/* Excel Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center justify-center gap-2.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>{isExporting ? 'Mengekspor Excel...' : 'Ekspor ke Microsoft Excel (.xlsx)'}</span>
        </button>
      </div>

      {/* Custom Date Range Pickers if active */}
      {periodType === 'custom' && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          <span className="text-blue-600 font-semibold">
            Periode terpilih: {periodLabel}
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Pengeluaran Periode
          </span>
          <div className="mt-2 text-2xl font-black text-rose-600 tracking-tight">
            {formatRupiah(totalExpense)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block font-medium">
            {periodLabel}
          </span>
        </div>

        {/* Daily Average */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Rata-rata Harian
          </span>
          <div className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
            {formatRupiah(dailyAverage)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block font-medium">
            Berdasarkan rentang {daysCount} hari
          </span>
        </div>

        {/* Largest Expense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Pengeluaran Terbesar
          </span>
          <div className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
            {formatRupiah(largestExpense)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block font-medium">
            Transaksi tunggal maksimum
          </span>
        </div>

        {/* Total Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Jumlah Transaksi
          </span>
          <div className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
            {filteredTxs.length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block font-medium">
            Catatan transaksi tersimpan
          </span>
        </div>
      </div>

      {/* Grid: Category Breakdown & Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Pengeluaran Berdasarkan Kategori
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
              {categoryStats.length} Kategori
            </span>
          </div>

          {categoryStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Belum ada data pengeluaran pada periode ini.
            </p>
          ) : (
            <div className="space-y-3">
              {categoryStats.map((item) => (
                <div key={item.cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CategoryIcon
                        name={item.cat.icon}
                        color={item.cat.color}
                        size={14}
                      />
                      <span className="font-bold text-slate-800">{item.cat.name}</span>
                      <span className="text-slate-400">({item.count} tx)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">
                        {formatRupiah(item.amount)}
                      </span>
                      <span className="text-slate-400 ml-1.5 font-medium">
                        ({item.percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: item.cat.color,
                        width: `${item.percent}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Pengeluaran Berdasarkan Metode Bayar
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
              {paymentMethodStats.length} Metode
            </span>
          </div>

          {paymentMethodStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Belum ada data transaksi pada periode ini.
            </p>
          ) : (
            <div className="space-y-3">
              {paymentMethodStats.map((item) => (
                <div key={item.method} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.method}</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">
                        {formatRupiah(item.amount)}
                      </span>
                      <span className="text-slate-400 ml-1.5 font-medium">
                        ({item.percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
