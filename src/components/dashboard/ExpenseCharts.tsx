'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Category, Transaction } from '@/lib/types';
import {
  BULAN_INDONESIA,
  BULAN_PENDEK,
  formatRupiah,
} from '@/lib/formatters';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ExpenseChartsProps {
  transactions: Transaction[];
  categories: Category[];
  currentMonth: string;
  darkMode?: boolean;
}

export function ExpenseCharts({
  transactions,
  categories,
  currentMonth,
  darkMode = false,
}: ExpenseChartsProps) {
  // 1. Daily Expenses (Current Month)
  const dailyData = useMemo(() => {
    const currentMonthTxs = transactions.filter(
      (t) => t.date.startsWith(currentMonth) && t.type !== 'income'
    );
    const [y, m] = currentMonth.split('-').map(Number);
    const daysInMonth = y && m ? new Date(y, m, 0).getDate() : 30;

    const daysMap: Record<number, number> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      daysMap[i] = 0;
    }

    currentMonthTxs.forEach((t) => {
      const day = parseInt(t.date.split('-')[2], 10);
      if (daysMap[day] !== undefined) {
        daysMap[day] += t.amount;
      }
    });

    const labels = Object.keys(daysMap).map((d) => `Tgl ${d}`);
    const data = Object.values(daysMap);

    return {
      labels,
      datasets: [
        {
          label: 'Pengeluaran Harian (Rp)',
          data,
          fill: true,
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#2563EB',
        },
      ],
    };
  }, [transactions, currentMonth]);

  // 2. Category Breakdown (Doughnut)
  const categoryData = useMemo(() => {
    const currentMonthTxs = transactions.filter(
      (t) => t.date.startsWith(currentMonth) && t.type !== 'income'
    );
    const catMap: Record<string, { name: string; amount: number; color: string }> = {};

    categories.forEach((c) => {
      catMap[c.id] = { name: c.name, amount: 0, color: c.color };
    });

    currentMonthTxs.forEach((t) => {
      if (catMap[t.categoryId]) {
        catMap[t.categoryId].amount += t.amount;
      } else {
        catMap['other'] = {
          name: 'Lain-lain',
          amount: (catMap['other']?.amount || 0) + t.amount,
          color: '#94A3B8',
        };
      }
    });

    const activeCats = Object.values(catMap).filter((c) => c.amount > 0);
    activeCats.sort((a, b) => b.amount - a.amount);

    return {
      labels: activeCats.map((c) => c.name),
      datasets: [
        {
          data: activeCats.map((c) => c.amount),
          backgroundColor: activeCats.map((c) => c.color),
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverOffset: 6,
        },
      ],
      hasData: activeCats.length > 0,
    };
  }, [transactions, categories, currentMonth]);

  // 3. Monthly Comparison (Last 6 Months relative to currentMonth)
  const monthlyComparisonData = useMemo(() => {
    const [currY, currM] = currentMonth.split('-').map(Number);
    const months: { key: string; label: string }[] = [];

    for (let i = 5; i >= 0; i--) {
      let m = (currM || 11) - i;
      let y = currY || 2026;
      while (m < 1) {
        m += 12;
        y -= 1;
      }
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const label = `${BULAN_PENDEK[m - 1]} ${y}`;
      months.push({ key, label });
    }

    const monthTotals = months.map((m) => {
      return transactions
        .filter((t) => t.date.startsWith(m.key))
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return {
      labels: months.map((m) => m.label),
      datasets: [
        {
          label: 'Total Pengeluaran (Rp)',
          data: monthTotals,
          backgroundColor: months.map((m, idx) =>
            idx === months.length - 1 ? '#2563EB' : '#93C5FD'
          ),
          borderRadius: 8,
          barPercentage: 0.6,
        },
      ],
    };
  }, [transactions, currentMonth]);

  // 4. Payment Method Distribution
  const paymentMethodData = useMemo(() => {
    const currentMonthTxs = transactions.filter(
      (t) => t.date.startsWith(currentMonth) && t.type !== 'income'
    );
    const methodMap: Record<string, number> = {};

    currentMonthTxs.forEach((t) => {
      methodMap[t.paymentMethod] = (methodMap[t.paymentMethod] || 0) + t.amount;
    });

    const labels = Object.keys(methodMap);
    const data = Object.values(methodMap);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

    return {
      labels,
      datasets: [
        {
          label: 'Nominal (Rp)',
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderRadius: 6,
        },
      ],
      hasData: labels.length > 0,
    };
  }, [transactions, currentMonth]);

  const tickColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
  const legendColor = darkMode ? '#e2e8f0' : '#334155';

  const currencyTooltipOptions = {
    callbacks: {
      label: (context: any) => {
        const val = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
        return ` ${formatRupiah(val)}`;
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Daily Trend */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tren Pengeluaran Harian</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Bulan berjalan</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg">
              Area Chart
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <Line
              data={dailyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: currencyTooltipOptions,
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 10, font: { size: 10 }, color: tickColor },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: {
                      font: { size: 10 },
                      color: tickColor,
                      callback: (val) => formatRupiah(Number(val), false),
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart 2: Category Donut */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Proporsi Berdasarkan Kategori</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Bulan berjalan</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-lg">
              Donut Chart
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            {categoryData.hasData ? (
              <Doughnut
                data={categoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '68%',
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { boxWidth: 12, font: { size: 11 }, padding: 12, color: legendColor },
                    },
                    tooltip: currencyTooltipOptions,
                  },
                }}
              />
            ) : (
              <div className="text-center text-slate-400 dark:text-slate-500 text-xs py-12">
                Belum ada transaksi di bulan ini
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Monthly Comparison */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Perbandingan Pengeluaran Antar Bulan</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">6 Bulan Terakhir</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-lg">
              Bar Chart
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <Bar
              data={monthlyComparisonData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: currencyTooltipOptions,
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 }, color: tickColor },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: {
                      font: { size: 10 },
                      color: tickColor,
                      callback: (val) => formatRupiah(Number(val), false),
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart 4: Payment Methods */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Distribusi Metode Pembayaran</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Bulan berjalan</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-lg">
              Horizontal Bar
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            {paymentMethodData.hasData ? (
              <Bar
                data={paymentMethodData}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: currencyTooltipOptions,
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: gridColor },
                      ticks: {
                        font: { size: 10 },
                        color: tickColor,
                        callback: (val) => formatRupiah(Number(val), false),
                      },
                    },
                    y: {
                      grid: { display: false },
                      ticks: { font: { size: 10 }, color: tickColor },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center text-slate-400 dark:text-slate-500 text-xs py-12">
                Belum ada transaksi di bulan ini
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
