// Indonesian currency and date formatting utilities
import { DashboardRange } from './types';

export function formatRupiah(amount: number | string, withPrefix = true): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(num));

  return withPrefix ? `Rp ${formatted}` : formatted;
}

export function parseRupiahInput(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  return parseInt(clean, 10) || 0;
}

const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const BULAN_PENDEK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

const HARI_INDONESIA = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function formatDateIndonesian(dateString: string, withDay = false): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length < 3) return dateString;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  const dayName = HARI_INDONESIA[d.getDay()];
  const monthName = BULAN_INDONESIA[month] || '';

  if (withDay) {
    return `${dayName}, ${day} ${monthName} ${year}`;
  }
  return `${day} ${monthName} ${year}`;
}

export function formatMonthIndonesian(monthYear: string): string {
  if (!monthYear) return '-';
  const parts = monthYear.split('-');
  if (parts.length < 2) return monthYear;

  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  return `${BULAN_INDONESIA[monthIdx] || ''} ${year}`;
}

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentMonthString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getPreviousMonthString(monthYear: string): string {
  const parts = monthYear.split('-');
  let y = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  m -= 1;
  if (m < 1) {
    m = 12;
    y -= 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function getNextMonthString(monthYear: string): string {
  const parts = monthYear.split('-');
  let y = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  m += 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function getDaysInMonth(monthYear: string): number {
  if (!monthYear) return 30;
  const parts = monthYear.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(y) || isNaN(m)) return 30;
  return new Date(y, m, 0).getDate();
}

export function subtractMonths(monthYear: string, count: number): string {
  if (!monthYear) return monthYear;
  const parts = monthYear.split('-');
  let y = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  if (isNaN(y) || isNaN(m)) return monthYear;
  m -= count;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}

export interface RangeDetails {
  startDate: string;
  endDate: string;
  label: string;
  periodName: string;
  shortLabel: string;
  monthsList: string[];
  prevStartDate: string;
  prevEndDate: string;
}

export function getRangeDetails(
  endMonthYear: string,
  range: DashboardRange
): RangeDetails {
  const endDays = getDaysInMonth(endMonthYear);

  if (range === 'all') {
    return {
      startDate: '',
      endDate: '',
      label: 'Semua Riwayat Transaksi',
      periodName: 'Semua Waktu',
      shortLabel: 'Semua',
      monthsList: [],
      prevStartDate: '',
      prevEndDate: '',
    };
  }

  let monthCount = 1;
  let periodName = `1 Bulan (${formatMonthIndonesian(endMonthYear)})`;
  let shortLabel = formatMonthIndonesian(endMonthYear);

  if (range === '3m') {
    monthCount = 3;
    periodName = '3 Bulan Terakhir';
    shortLabel = '3 Bulan';
  } else if (range === '6m') {
    monthCount = 6;
    periodName = '6 Bulan Terakhir';
    shortLabel = '6 Bulan';
  } else if (range === '1y') {
    monthCount = 12;
    periodName = '1 Tahun Terakhir';
    shortLabel = '1 Tahun';
  }

  // Generate months list from oldest to newest
  const monthsList: string[] = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    monthsList.push(subtractMonths(endMonthYear, i));
  }

  const startMonthYear = monthsList[0];
  const startDate = `${startMonthYear}-01`;
  const endDate = `${endMonthYear}-${String(endDays).padStart(2, '0')}`;

  const startFormatted = formatDateIndonesian(startDate);
  const endFormatted = formatDateIndonesian(endDate);
  const label =
    monthCount === 1
      ? formatMonthIndonesian(endMonthYear)
      : `${startFormatted} – ${endFormatted}`;

  // Previous comparison range (exact equivalent prior window)
  const prevEndMonthYear = subtractMonths(endMonthYear, monthCount);
  const prevStartMonthYear = subtractMonths(prevEndMonthYear, monthCount - 1);
  const prevEndDays = getDaysInMonth(prevEndMonthYear);
  const prevStartDate = `${prevStartMonthYear}-01`;
  const prevEndDate = `${prevEndMonthYear}-${String(prevEndDays).padStart(2, '0')}`;

  return {
    startDate,
    endDate,
    label,
    periodName,
    shortLabel,
    monthsList,
    prevStartDate,
    prevEndDate,
  };
}

export { BULAN_INDONESIA, BULAN_PENDEK, HARI_INDONESIA };
