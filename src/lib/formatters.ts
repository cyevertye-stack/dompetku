// Indonesian currency and date formatting utilities

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
  const [y, m] = monthYear.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export { BULAN_INDONESIA, BULAN_PENDEK, HARI_INDONESIA };
