import ExcelJS from 'exceljs';
import {
  Category,
  GoldSavings,
  SavingsGoal,
  SavingsTransaction,
  Transaction,
} from './types';
import { formatDateIndonesian, formatRupiah } from './formatters';

interface ExportExcelParams {
  periodLabel: string;
  transactions: Transaction[];
  categories: Category[];
  totalBudget?: number;
  savingsGoals?: SavingsGoal[];
  savingsTransactions?: SavingsTransaction[];
  goldSavings?: GoldSavings[];
}

export async function generateExpenseExcel({
  periodLabel,
  transactions,
  categories,
  totalBudget = 0,
  savingsGoals = [],
  savingsTransactions = [],
  goldSavings = [],
}: ExportExcelParams): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DompetKu - Personal Expense & Savings Tracker';
  workbook.lastModifiedBy = 'DompetKu';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color Palette Constants
  const NAVY_DARK = '0F172A';
  const BLUE_PRIMARY = '1E3A8A';
  const BLUE_LIGHT = 'DBEAFE';
  const GRAY_LIGHT = 'F8FAFC';
  const GRAY_BORDER = 'CBD5E1';
  const GREEN_ACCENT = '059669';
  const GREEN_LIGHT = 'D1FAE5';
  const RED_ACCENT = 'DC2626';
  const RED_LIGHT = 'FEE2E2';
  const GOLD_ACCENT = 'D97706';
  const GOLD_LIGHT = 'FEF3C7';
  const PURPLE_ACCENT = '7C3AED';
  const PURPLE_LIGHT = 'EDE9FE';

  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  // Financial Computations
  const totalExpense = transactions
    .filter((t) => t.type !== 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;
  const remainingBudget = totalBudget > 0 ? totalBudget - totalExpense : 0;

  // Savings Computations
  const totalDeposits = savingsTransactions
    .filter((s) => s.type === 'deposit')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalWithdraws = savingsTransactions
    .filter((s) => s.type === 'withdraw')
    .reduce((sum, s) => sum + s.amount, 0);

  const savingsBalance = totalDeposits - totalWithdraws;
  const goalsAccumulated = savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const effectiveCashSavings = Math.max(savingsBalance, goalsAccumulated, 0);

  // Gold Computations
  const totalGoldWeight = goldSavings.reduce((sum, g) => sum + (g.weightGrams || 0), 0);
  const totalGoldCost = goldSavings.reduce((sum, g) => sum + (g.purchasePrice || 0), 0);
  const totalGoldValue = goldSavings.reduce(
    (sum, g) =>
      sum + (g.currentEstimatedPricePerGram ? g.currentEstimatedPricePerGram * g.weightGrams : g.purchasePrice || 0),
    0
  );
  const totalGoldGainLoss = totalGoldValue - totalGoldCost;

  const totalNetWorth = netCashflow + effectiveCashSavings + totalGoldValue;

  const printTimestamp = formatDateIndonesian(new Date().toISOString().split('T')[0], true);

  // =============================================================
  // SHEET 1: DASHBOARD & RINGKASAN KEUANGAN
  // =============================================================
  const sheetDashboard = workbook.addWorksheet('Dashboard Keuangan', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  // Title Banner
  sheetDashboard.mergeCells('A1:G1');
  const titleCell = sheetDashboard.getCell('A1');
  titleCell.value = 'DOMPETKU – LAPORAN KEUANGAN & PORTOFOLIO TABUNGAN';
  titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetDashboard.getRow(1).height = 36;

  // Subtitle / Period
  sheetDashboard.mergeCells('A2:G2');
  const subtitleCell = sheetDashboard.getCell('A2');
  subtitleCell.value = `Periode: ${periodLabel}  |  Dicetak pada: ${printTimestamp}`;
  subtitleCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetDashboard.getRow(2).height = 20;

  sheetDashboard.addRow([]);

  // SECTION 1: RINGKASAN ARUS KAS (CASH FLOW)
  sheetDashboard.mergeCells('A4:G4');
  const sec1 = sheetDashboard.getCell('A4');
  sec1.value = '1. RINGKASAN ARUS KAS (CASH FLOW)';
  sec1.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  sec1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_PRIMARY } };
  sec1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheetDashboard.getRow(4).height = 22;

  // Row 5: Total Pemasukan vs Batas Anggaran
  sheetDashboard.mergeCells('A5:B5');
  sheetDashboard.getCell('A5').value = 'Total Pemasukan (Cash In):';
  sheetDashboard.getCell('A5').font = { bold: true };
  sheetDashboard.getCell('C5').value = totalIncome;
  sheetDashboard.getCell('C5').numFmt = '"Rp "#,##0';
  sheetDashboard.getCell('C5').font = { bold: true, size: 11, color: { argb: GREEN_ACCENT } };

  sheetDashboard.mergeCells('E5:F5');
  sheetDashboard.getCell('E5').value = 'Batas Anggaran Bulanan:';
  sheetDashboard.getCell('E5').font = { bold: true };
  sheetDashboard.getCell('G5').value = totalBudget > 0 ? totalBudget : 'Tidak diatur';
  if (totalBudget > 0) sheetDashboard.getCell('G5').numFmt = '"Rp "#,##0';
  sheetDashboard.getCell('G5').font = { bold: true, color: { argb: BLUE_PRIMARY } };

  // Row 6: Total Pengeluaran vs Sisa Anggaran
  sheetDashboard.mergeCells('A6:B6');
  sheetDashboard.getCell('A6').value = 'Total Pengeluaran (Cash Out):';
  sheetDashboard.getCell('A6').font = { bold: true };
  sheetDashboard.getCell('C6').value = totalExpense;
  sheetDashboard.getCell('C6').numFmt = '"Rp "#,##0';
  sheetDashboard.getCell('C6').font = { bold: true, size: 11, color: { argb: RED_ACCENT } };

  sheetDashboard.mergeCells('E6:F6');
  sheetDashboard.getCell('E6').value = 'Sisa Anggaran Belanja:';
  sheetDashboard.getCell('E6').font = { bold: true };
  sheetDashboard.getCell('G6').value = totalBudget > 0 ? remainingBudget : '-';
  if (totalBudget > 0) sheetDashboard.getCell('G6').numFmt = '"Rp "#,##0';
  sheetDashboard.getCell('G6').font = {
    bold: true,
    color: { argb: remainingBudget >= 0 ? GREEN_ACCENT : RED_ACCENT },
  };

  // Row 7: Sisa Saldo Kas Bersih vs Status Anggaran
  sheetDashboard.mergeCells('A7:B7');
  sheetDashboard.getCell('A7').value = 'Sisa Saldo Kas Bersih:';
  sheetDashboard.getCell('A7').font = { bold: true };
  sheetDashboard.getCell('C7').value = netCashflow;
  sheetDashboard.getCell('C7').numFmt = '"Rp "#,##0';
  sheetDashboard.getCell('C7').font = {
    bold: true,
    size: 11,
    color: { argb: netCashflow >= 0 ? GREEN_ACCENT : RED_ACCENT },
  };

  sheetDashboard.mergeCells('E7:F7');
  sheetDashboard.getCell('E7').value = 'Status Anggaran:';
  sheetDashboard.getCell('E7').font = { bold: true };
  if (totalBudget > 0) {
    const usagePercent = Math.round((totalExpense / totalBudget) * 100);
    sheetDashboard.getCell('G7').value = `${usagePercent}% Terpakai (${remainingBudget >= 0 ? 'Aman' : 'Overbudget!'})`;
    sheetDashboard.getCell('G7').font = { bold: true, color: { argb: remainingBudget >= 0 ? GREEN_ACCENT : RED_ACCENT } };
  } else {
    sheetDashboard.getCell('G7').value = '-';
  }

  // Row 8: Jumlah Catatan Transaksi
  sheetDashboard.mergeCells('A8:B8');
  sheetDashboard.getCell('A8').value = 'Jumlah Catatan Transaksi:';
  sheetDashboard.getCell('A8').font = { bold: true };
  sheetDashboard.getCell('C8').value = transactions.length;
  sheetDashboard.getCell('C8').numFmt = '#,##0" Transaksi"';

  // SECTION 2: RINGKASAN TABUNGAN & PORTOFOLIO EMAS
  sheetDashboard.addRow([]);
  sheetDashboard.mergeCells('A10:G10');
  const sec2 = sheetDashboard.getCell('A10');
  sec2.value = '2. RINGKASAN TABUNGAN & PORTOFOLIO ASET';
  sec2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  sec2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_ACCENT } };
  sec2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheetDashboard.getRow(10).height = 22;

  // Row 11: Tabungan Tunai & Impian
  sheetDashboard.mergeCells('A11:B11');
  sheetDashboard.getCell('A11').value = 'Total Tabungan Tunai:';
  sheetDashboard.getCell('A11').font = { bold: true };
  sheetDashboard.getCell('C11').value = effectiveCashSavings;
  sheetDashboard.getCell('C11').numFmt = '"Rp "#,##0';
  sheetDashboard.getCell('C11').font = { bold: true, size: 11, color: { argb: GREEN_ACCENT } };

  sheetDashboard.mergeCells('E11:F11');
  sheetDashboard.getCell('E11').value = 'Target Impian Aktif:';
  sheetDashboard.getCell('E11').font = { bold: true };
  sheetDashboard.getCell('G11').value = savingsGoals.length;
  sheetDashboard.getCell('G11').numFmt = '#,##0" Target"';

  // Row 12: Tabungan Logam Mulia (Emas)
  sheetDashboard.mergeCells('A12:B12');
  sheetDashboard.getCell('A12').value = 'Total Berat Emas:';
  sheetDashboard.getCell('A12').font = { bold: true };
  sheetDashboard.getCell('C12').value = totalGoldWeight;
  sheetDashboard.getCell('C12').numFmt = '0.00" Gram"';
  sheetDashboard.getCell('C12').font = { bold: true, size: 11, color: { argb: GOLD_ACCENT } };

  sheetDashboard.mergeCells('E12:F12');
  sheetDashboard.getCell('E12').value = 'Estimasi Nilai Pasar Emas:';
  sheetDashboard.getCell('E12').font = { bold: true };
  sheetDashboard.getCell('G12').value = totalGoldValue;
  sheetDashboard.getCell('G12').numFmt = '"Rp "#,##0';
  sheetDashboard.getCell('G12').font = { bold: true, size: 11, color: { argb: GOLD_ACCENT } };

  // Row 13: Total Akumulasi Tabungan & Portofolio
  sheetDashboard.mergeCells('A13:B13');
  sheetDashboard.getCell('A13').value = 'Total Nilai Portofolio Tabungan:';
  sheetDashboard.getCell('A13').font = { bold: true, color: { argb: 'FF0F172A' } };
  sheetDashboard.getCell('C13').value = effectiveCashSavings + totalGoldValue;
  sheetDashboard.getCell('C13').numFmt = '"Rp "#,##0';
  sheetDashboard.getCell('C13').font = { bold: true, size: 12, color: { argb: BLUE_PRIMARY } };

  sheetDashboard.mergeCells('E13:F13');
  sheetDashboard.getCell('E13').value = 'Keuntungan Emas Saat Ini:';
  sheetDashboard.getCell('E13').font = { bold: true };
  sheetDashboard.getCell('G13').value = totalGoldGainLoss;
  sheetDashboard.getCell('G13').numFmt = '"Rp "#,##0';
  sheetDashboard.getCell('G13').font = {
    bold: true,
    color: { argb: totalGoldGainLoss >= 0 ? GREEN_ACCENT : RED_ACCENT },
  };

  // Border styling for KPI blocks
  [5, 6, 7, 8, 11, 12, 13].forEach((r) => {
    const row = sheetDashboard.getRow(r);
    row.height = 20;
    ['A', 'B', 'C', 'E', 'F', 'G'].forEach((col) => {
      row.getCell(col).border = {
        top: { style: 'thin', color: { argb: GRAY_BORDER } },
        bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
      };
    });
  });

  // SECTION 3: RINCIAN PENGELUARAN PER KATEGORI
  sheetDashboard.addRow([]);
  sheetDashboard.mergeCells('A15:G15');
  const catSecHeader = sheetDashboard.getCell('A15');
  catSecHeader.value = '3. RINCIAN PENGELUARAN PER KATEGORI';
  catSecHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  catSecHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_PRIMARY } };
  catSecHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheetDashboard.getRow(15).height = 22;

  const catHeadRow = sheetDashboard.addRow([
    'No',
    'Kategori Pengeluaran',
    'Jumlah Transaksi',
    'Total Pengeluaran (Rp)',
    'Persentase',
    'Batas Anggaran (Rp)',
    'Status Anggaran',
  ]);
  catHeadRow.height = 22;
  catHeadRow.font = { bold: true, color: { argb: 'FF0F172A' } };
  catHeadRow.alignment = { vertical: 'middle', horizontal: 'center' };
  catHeadRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_LIGHT } };
    cell.border = {
      top: { style: 'thin', color: { argb: GRAY_BORDER } },
      bottom: { style: 'medium', color: { argb: BLUE_PRIMARY } },
      left: { style: 'thin', color: { argb: GRAY_BORDER } },
      right: { style: 'thin', color: { argb: GRAY_BORDER } },
    };
  });

  const catStats = categories
    .map((cat) => {
      const catTxs = transactions.filter((t) => t.categoryId === cat.id && t.type !== 'income');
      const amount = catTxs.reduce((sum, t) => sum + t.amount, 0);
      const percent = totalExpense > 0 ? amount / totalExpense : 0;
      return { cat, count: catTxs.length, amount, percent };
    })
    .filter((s) => s.count > 0 || s.cat.budgetLimit > 0)
    .sort((a, b) => b.amount - a.amount);

  catStats.forEach((stat, idx) => {
    let statusText = '-';
    if (stat.cat.budgetLimit > 0) {
      if (stat.amount > stat.cat.budgetLimit) {
        statusText = 'Melebihi Batas!';
      } else if (stat.amount >= stat.cat.budgetLimit * 0.8) {
        statusText = 'Mendekati Batas';
      } else {
        statusText = 'Aman';
      }
    }

    const row = sheetDashboard.addRow([
      idx + 1,
      stat.cat.name,
      stat.count,
      stat.amount,
      stat.percent,
      stat.cat.budgetLimit > 0 ? stat.cat.budgetLimit : '-',
      statusText,
    ]);

    row.height = 20;
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'left' };
    row.getCell(3).alignment = { horizontal: 'center' };
    row.getCell(4).numFmt = '"Rp "#,##0';
    row.getCell(5).numFmt = '0.0%';
    if (stat.cat.budgetLimit > 0) row.getCell(6).numFmt = '"Rp "#,##0';
    row.getCell(7).alignment = { horizontal: 'center' };

    if (stat.amount > (stat.cat.budgetLimit || 0) && stat.cat.budgetLimit > 0) {
      row.getCell(7).font = { bold: true, color: { argb: RED_ACCENT } };
    } else if (statusText === 'Aman') {
      row.getCell(7).font = { bold: true, color: { argb: GREEN_ACCENT } };
    }

    if (idx % 2 === 1) {
      row.eachCell((c) => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } };
      });
    }

    row.eachCell((c) => {
      c.border = {
        top: { style: 'thin', color: { argb: GRAY_BORDER } },
        bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
        left: { style: 'thin', color: { argb: GRAY_BORDER } },
        right: { style: 'thin', color: { argb: GRAY_BORDER } },
      };
    });
  });

  const startRowCat = 17;
  const endRowCat = startRowCat + catStats.length - 1;
  if (catStats.length > 0) {
    const totalRow = sheetDashboard.addRow([
      '',
      'TOTAL PENGELUARAN',
      { formula: `SUM(C${startRowCat}:C${endRowCat})` },
      { formula: `SUM(D${startRowCat}:D${endRowCat})` },
      1.0,
      '',
      '',
    ]);
    totalRow.height = 22;
    totalRow.font = { bold: true };
    totalRow.getCell(2).alignment = { horizontal: 'right' };
    totalRow.getCell(3).alignment = { horizontal: 'center' };
    totalRow.getCell(4).numFmt = '"Rp "#,##0';
    totalRow.getCell(5).numFmt = '0.0%';
    totalRow.eachCell((c) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_LIGHT } };
      c.border = {
        top: { style: 'thin', color: { argb: BLUE_PRIMARY } },
        bottom: { style: 'double', color: { argb: BLUE_PRIMARY } },
      };
    });
  }

  sheetDashboard.columns = [
    { width: 6 },
    { width: 28 },
    { width: 18 },
    { width: 24 },
    { width: 14 },
    { width: 22 },
    { width: 18 },
  ];

  // =============================================================
  // SHEET 2: DETAIL TRANSAKSI (PEMASUKAN & PENGELUARAN)
  // =============================================================
  const sheetTransactions = workbook.addWorksheet('Detail Transaksi', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  sheetTransactions.mergeCells('A1:I1');
  const txTitle = sheetTransactions.getCell('A1');
  txTitle.value = 'DOMPETKU – DETAIL SEMUA TRANSAKSI (PEMASUKAN & PENGELUARAN)';
  txTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  txTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
  txTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetTransactions.getRow(1).height = 30;

  sheetTransactions.mergeCells('A2:I2');
  const txSub = sheetTransactions.getCell('A2');
  txSub.value = `Filter Periode: ${periodLabel}  |  Total: ${transactions.length} Catatan`;
  txSub.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  txSub.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetTransactions.getRow(2).height = 20;

  sheetTransactions.addRow([]);

  const txHeaderRow = sheetTransactions.addRow([
    'No',
    'Tanggal',
    'Jenis',
    'Keterangan Transaksi',
    'Kategori',
    'Metode Pembayaran',
    'Pemasukan (Rp)',
    'Pengeluaran (Rp)',
    'Catatan',
  ]);
  txHeaderRow.height = 24;
  txHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  txHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  txHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_PRIMARY } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'medium', color: { argb: NAVY_DARK } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    };
  });

  transactions.forEach((tx, idx) => {
    const isIncome = tx.type === 'income';
    const cat = categoryMap.get(tx.categoryId);
    const catName = cat ? cat.name : 'Lain-lain';

    const row = sheetTransactions.addRow([
      idx + 1,
      formatDateIndonesian(tx.date),
      isIncome ? 'Pemasukan' : 'Pengeluaran',
      tx.title,
      catName,
      tx.paymentMethod,
      isIncome ? tx.amount : 0,
      !isIncome ? tx.amount : 0,
      tx.notes || '-',
    ]);

    row.height = 20;
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(3).alignment = { horizontal: 'center' };
    row.getCell(3).font = { bold: true, color: { argb: isIncome ? GREEN_ACCENT : RED_ACCENT } };
    row.getCell(4).alignment = { horizontal: 'left' };
    row.getCell(5).alignment = { horizontal: 'left' };
    row.getCell(6).alignment = { horizontal: 'center' };

    row.getCell(7).numFmt = '"Rp "#,##0';
    row.getCell(7).alignment = { horizontal: 'right' };
    if (isIncome) row.getCell(7).font = { bold: true, color: { argb: GREEN_ACCENT } };

    row.getCell(8).numFmt = '"Rp "#,##0';
    row.getCell(8).alignment = { horizontal: 'right' };
    if (!isIncome) row.getCell(8).font = { bold: true, color: { argb: RED_ACCENT } };

    row.getCell(9).alignment = { horizontal: 'left' };

    if (idx % 2 === 1) {
      row.eachCell((c) => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } };
      });
    }

    row.eachCell((c) => {
      c.border = {
        top: { style: 'thin', color: { argb: GRAY_BORDER } },
        bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
        left: { style: 'thin', color: { argb: GRAY_BORDER } },
        right: { style: 'thin', color: { argb: GRAY_BORDER } },
      };
    });
  });

  const startTxRow = 5;
  const endTxRow = startTxRow + transactions.length - 1;
  if (transactions.length > 0) {
    const totalRow = sheetTransactions.addRow([
      '',
      '',
      '',
      '',
      '',
      'TOTAL KESELURUHAN:',
      { formula: `SUM(G${startTxRow}:G${endTxRow})` },
      { formula: `SUM(H${startTxRow}:H${endTxRow})` },
      '',
    ]);
    totalRow.height = 24;
    totalRow.font = { bold: true };
    totalRow.getCell(6).alignment = { horizontal: 'right' };
    totalRow.getCell(7).numFmt = '"Rp "#,##0';
    totalRow.getCell(7).font = { bold: true, color: { argb: GREEN_ACCENT } };
    totalRow.getCell(8).numFmt = '"Rp "#,##0';
    totalRow.getCell(8).font = { bold: true, color: { argb: RED_ACCENT } };

    totalRow.eachCell((c) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_LIGHT } };
      c.border = {
        top: { style: 'thin', color: { argb: BLUE_PRIMARY } },
        bottom: { style: 'double', color: { argb: BLUE_PRIMARY } },
      };
    });
  }

  sheetTransactions.columns = [
    { width: 6 },
    { width: 16 },
    { width: 15 },
    { width: 30 },
    { width: 22 },
    { width: 22 },
    { width: 20 },
    { width: 20 },
    { width: 32 },
  ];

  // =============================================================
  // SHEET 3: TABUNGAN & IMPIAN (SAVINGS & GOALS)
  // =============================================================
  const sheetSavings = workbook.addWorksheet('Tabungan & Impian', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  sheetSavings.mergeCells('A1:H1');
  const savTitle = sheetSavings.getCell('A1');
  savTitle.value = 'DOMPETKU – TABUNGAN & TARGET IMPIAN KEUANGAN';
  savTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  savTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_ACCENT } };
  savTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetSavings.getRow(1).height = 30;

  sheetSavings.mergeCells('A2:H2');
  const savSub = sheetSavings.getCell('A2');
  savSub.value = `Ringkasan Tabungan Tunai & Target Impian Masa Depan  |  Dicetak pada: ${printTimestamp}`;
  savSub.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  savSub.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetSavings.getRow(2).height = 20;

  sheetSavings.addRow([]);

  // SUBSECTION A: DAFTAR TARGET IMPIAN TABUNGAN
  sheetSavings.mergeCells('A4:H4');
  const secGoalHeader = sheetSavings.getCell('A4');
  secGoalHeader.value = 'A. DAFTAR TARGET IMPIAN TABUNGAN (SAVINGS GOALS)';
  secGoalHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  secGoalHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
  secGoalHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheetSavings.getRow(4).height = 22;

  const goalHeaderRow = sheetSavings.addRow([
    'No',
    'Nama Target Impian',
    'Target Nominal (Rp)',
    'Terkumpul Saat Ini (Rp)',
    'Progres (%)',
    'Sisa Perlu Ditabung (Rp)',
    'Target Tanggal',
    'Status Capaian',
  ]);
  goalHeaderRow.height = 22;
  goalHeaderRow.font = { bold: true, color: { argb: 'FF0F172A' } };
  goalHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  goalHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } };
    cell.border = {
      top: { style: 'thin', color: { argb: GRAY_BORDER } },
      bottom: { style: 'medium', color: { argb: GREEN_ACCENT } },
      left: { style: 'thin', color: { argb: GRAY_BORDER } },
      right: { style: 'thin', color: { argb: GRAY_BORDER } },
    };
  });

  if (savingsGoals.length === 0) {
    const emptyRow = sheetSavings.addRow([
      '-',
      'Belum ada target impian khusus (Tabungan Bebas)',
      '-',
      effectiveCashSavings,
      '100%',
      0,
      '-',
      'Aktif Berjalan',
    ]);
    emptyRow.height = 20;
    emptyRow.getCell(1).alignment = { horizontal: 'center' };
    emptyRow.getCell(4).numFmt = '"Rp "#,##0';
    emptyRow.getCell(5).alignment = { horizontal: 'center' };
    emptyRow.getCell(6).numFmt = '"Rp "#,##0';
    emptyRow.getCell(8).alignment = { horizontal: 'center' };
    emptyRow.eachCell((c) => {
      c.border = {
        top: { style: 'thin', color: { argb: GRAY_BORDER } },
        bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
      };
    });
  } else {
    savingsGoals.forEach((goal, idx) => {
      const target = goal.targetAmount || 0;
      const current = goal.currentAmount || 0;
      const progress = target > 0 ? current / target : 0;
      const remaining = Math.max(0, target - current);
      const isCompleted = current >= target && target > 0;

      const row = sheetSavings.addRow([
        idx + 1,
        goal.title,
        target,
        current,
        progress,
        remaining,
        goal.targetDate ? formatDateIndonesian(goal.targetDate) : 'Tidak ditentukan',
        isCompleted ? 'Target Tercapai! 🏆' : 'Dalam Proses',
      ]);

      row.height = 20;
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(2).alignment = { horizontal: 'left' };
      row.getCell(3).numFmt = '"Rp "#,##0';
      row.getCell(4).numFmt = '"Rp "#,##0';
      row.getCell(5).numFmt = '0.0%';
      row.getCell(6).numFmt = '"Rp "#,##0';
      row.getCell(7).alignment = { horizontal: 'center' };
      row.getCell(8).alignment = { horizontal: 'center' };
      row.getCell(8).font = {
        bold: true,
        color: { argb: isCompleted ? GREEN_ACCENT : 'FF2563EB' },
      };

      if (idx % 2 === 1) {
        row.eachCell((c) => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } };
        });
      }

      row.eachCell((c) => {
        c.border = {
          top: { style: 'thin', color: { argb: GRAY_BORDER } },
          bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
          left: { style: 'thin', color: { argb: GRAY_BORDER } },
          right: { style: 'thin', color: { argb: GRAY_BORDER } },
        };
      });
    });
  }

  // SUBSECTION B: RIWAYAT MUTASI TABUNGAN
  sheetSavings.addRow([]);
  sheetSavings.addRow([]);
  const secTxRowIndex = sheetSavings.rowCount + 1;
  sheetSavings.mergeCells(`A${secTxRowIndex}:H${secTxRowIndex}`);
  const secTxHeader = sheetSavings.getCell(`A${secTxRowIndex}`);
  secTxHeader.value = 'B. RIWAYAT MUTASI TABUNGAN (SETOR & TARIK)';
  secTxHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  secTxHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
  secTxHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheetSavings.getRow(secTxRowIndex).height = 22;

  const mutasiHeaderRow = sheetSavings.addRow([
    'No',
    'Tanggal Mutasi',
    'Jenis Mutasi',
    'Target Terkait',
    'Nominal Setor (Rp)',
    'Nominal Tarik (Rp)',
    'Saldo Berjalan (Rp)',
    'Catatan / Keterangan',
  ]);
  mutasiHeaderRow.height = 22;
  mutasiHeaderRow.font = { bold: true, color: { argb: 'FF0F172A' } };
  mutasiHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  mutasiHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } };
    cell.border = {
      top: { style: 'thin', color: { argb: GRAY_BORDER } },
      bottom: { style: 'medium', color: { argb: GREEN_ACCENT } },
      left: { style: 'thin', color: { argb: GRAY_BORDER } },
      right: { style: 'thin', color: { argb: GRAY_BORDER } },
    };
  });

  let runningSavingsBalance = 0;
  // Sort oldest to newest for chronological running balance
  const sortedSavingsTxs = [...savingsTransactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedSavingsTxs.length === 0) {
    const emptyMutasi = sheetSavings.addRow([
      '-',
      '-',
      '-',
      '-',
      0,
      0,
      0,
      'Belum ada riwayat mutasi tabungan yang dicatat',
    ]);
    emptyMutasi.height = 20;
    emptyMutasi.eachCell((c) => {
      c.border = {
        top: { style: 'thin', color: { argb: GRAY_BORDER } },
        bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
      };
    });
  } else {
    sortedSavingsTxs.forEach((sTx, idx) => {
      const isDeposit = sTx.type === 'deposit';
      if (isDeposit) {
        runningSavingsBalance += sTx.amount;
      } else {
        runningSavingsBalance -= sTx.amount;
      }

      const row = sheetSavings.addRow([
        idx + 1,
        formatDateIndonesian(sTx.date),
        isDeposit ? '🟢 Setor Tabungan' : '🔴 Ambil Tabungan',
        sTx.goalTitle || 'Tabungan Umum',
        isDeposit ? sTx.amount : 0,
        !isDeposit ? sTx.amount : 0,
        runningSavingsBalance,
        sTx.notes || '-',
      ]);

      row.height = 20;
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(3).alignment = { horizontal: 'center' };
      row.getCell(4).alignment = { horizontal: 'left' };
      row.getCell(5).numFmt = '"Rp "#,##0';
      row.getCell(5).alignment = { horizontal: 'right' };
      if (isDeposit) row.getCell(5).font = { bold: true, color: { argb: GREEN_ACCENT } };

      row.getCell(6).numFmt = '"Rp "#,##0';
      row.getCell(6).alignment = { horizontal: 'right' };
      if (!isDeposit) row.getCell(6).font = { bold: true, color: { argb: RED_ACCENT } };

      row.getCell(7).numFmt = '"Rp "#,##0';
      row.getCell(7).alignment = { horizontal: 'right' };
      row.getCell(7).font = { bold: true };
      row.getCell(8).alignment = { horizontal: 'left' };

      if (idx % 2 === 1) {
        row.eachCell((c) => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } };
        });
      }

      row.eachCell((c) => {
        c.border = {
          top: { style: 'thin', color: { argb: GRAY_BORDER } },
          bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
          left: { style: 'thin', color: { argb: GRAY_BORDER } },
          right: { style: 'thin', color: { argb: GRAY_BORDER } },
        };
      });
    });
  }

  sheetSavings.columns = [
    { width: 6 },
    { width: 18 },
    { width: 22 },
    { width: 28 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 30 },
  ];

  // =============================================================
  // SHEET 4: PORTOFOLIO EMAS (GOLD SAVINGS)
  // =============================================================
  const sheetGold = workbook.addWorksheet('Portofolio Emas', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  sheetGold.mergeCells('A1:J1');
  const goldTitle = sheetGold.getCell('A1');
  goldTitle.value = 'DOMPETKU – PORTOFOLIO TABUNGAN EMAS & LOGAM MULIA';
  goldTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  goldTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_ACCENT } };
  goldTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetGold.getRow(1).height = 30;

  sheetGold.mergeCells('A2:J2');
  const goldSub = sheetGold.getCell('A2');
  goldSub.value = `Daftar Kepemilikan Emas Batangan & Perhiasan  |  Dicetak pada: ${printTimestamp}`;
  goldSub.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  goldSub.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetGold.getRow(2).height = 20;

  sheetGold.addRow([]);

  const goldHeaderRow = sheetGold.addRow([
    'No',
    'Tanggal Beli',
    'Jenis / Merk Emas',
    'Kadar / Karat',
    'Nama / Model Barang',
    'Berat (Gram)',
    'Harga Beli Total (Rp)',
    'Harga Beli / Gram (Rp)',
    'Estimasi Nilai Sekarang (Rp)',
    'Lokasi Simpan / Catatan',
  ]);
  goldHeaderRow.height = 24;
  goldHeaderRow.font = { bold: true, color: { argb: 'FF0F172A' } };
  goldHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  goldHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_LIGHT } };
    cell.border = {
      top: { style: 'thin', color: { argb: GRAY_BORDER } },
      bottom: { style: 'medium', color: { argb: GOLD_ACCENT } },
      left: { style: 'thin', color: { argb: GRAY_BORDER } },
      right: { style: 'thin', color: { argb: GRAY_BORDER } },
    };
  });

  if (goldSavings.length === 0) {
    const emptyGold = sheetGold.addRow([
      '-',
      '-',
      '-',
      '-',
      '-',
      0,
      0,
      0,
      0,
      'Belum ada aset emas yang dicatat',
    ]);
    emptyGold.height = 20;
    emptyGold.eachCell((c) => {
      c.border = {
        top: { style: 'thin', color: { argb: GRAY_BORDER } },
        bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
      };
    });
  } else {
    goldSavings.forEach((gold, idx) => {
      const estPricePerGram = gold.currentEstimatedPricePerGram || gold.pricePerGram || 0;
      const currentEstimatedValue = estPricePerGram * (gold.weightGrams || 0);

      const row = sheetGold.addRow([
        idx + 1,
        formatDateIndonesian(gold.purchaseDate),
        gold.type,
        gold.karat || '24K',
        gold.itemName || gold.jewelryType || '-',
        gold.weightGrams,
        gold.purchasePrice,
        gold.pricePerGram,
        currentEstimatedValue,
        gold.storageLocation || gold.notes || '-',
      ]);

      row.height = 20;
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(3).alignment = { horizontal: 'center' };
      row.getCell(4).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'left' };
      row.getCell(6).numFmt = '0.00" g"';
      row.getCell(6).alignment = { horizontal: 'right' };
      row.getCell(7).numFmt = '"Rp "#,##0';
      row.getCell(7).alignment = { horizontal: 'right' };
      row.getCell(8).numFmt = '"Rp "#,##0';
      row.getCell(8).alignment = { horizontal: 'right' };
      row.getCell(9).numFmt = '"Rp "#,##0';
      row.getCell(9).alignment = { horizontal: 'right' };
      row.getCell(9).font = { bold: true, color: { argb: GOLD_ACCENT } };
      row.getCell(10).alignment = { horizontal: 'left' };

      if (idx % 2 === 1) {
        row.eachCell((c) => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } };
        });
      }

      row.eachCell((c) => {
        c.border = {
          top: { style: 'thin', color: { argb: GRAY_BORDER } },
          bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
          left: { style: 'thin', color: { argb: GRAY_BORDER } },
          right: { style: 'thin', color: { argb: GRAY_BORDER } },
        };
      });
    });

    const startGoldRow = 5;
    const endGoldRow = startGoldRow + goldSavings.length - 1;
    const goldTotalRow = sheetGold.addRow([
      '',
      '',
      '',
      '',
      'TOTAL PORTOFOLIO EMAS:',
      { formula: `SUM(F${startGoldRow}:F${endGoldRow})` },
      { formula: `SUM(G${startGoldRow}:G${endGoldRow})` },
      '',
      { formula: `SUM(I${startGoldRow}:I${endGoldRow})` },
      '',
    ]);
    goldTotalRow.height = 24;
    goldTotalRow.font = { bold: true };
    goldTotalRow.getCell(5).alignment = { horizontal: 'right' };
    goldTotalRow.getCell(6).numFmt = '0.00" g"';
    goldTotalRow.getCell(7).numFmt = '"Rp "#,##0';
    goldTotalRow.getCell(9).numFmt = '"Rp "#,##0';
    goldTotalRow.getCell(9).font = { bold: true, color: { argb: GOLD_ACCENT } };

    goldTotalRow.eachCell((c) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD_LIGHT } };
      c.border = {
        top: { style: 'thin', color: { argb: GOLD_ACCENT } },
        bottom: { style: 'double', color: { argb: GOLD_ACCENT } },
      };
    });
  }

  sheetGold.columns = [
    { width: 6 },
    { width: 16 },
    { width: 18 },
    { width: 16 },
    { width: 24 },
    { width: 16 },
    { width: 22 },
    { width: 22 },
    { width: 24 },
    { width: 28 },
  ];

  // =============================================================
  // SHEET 5: RINGKASAN KATEGORI
  // =============================================================
  const sheetCategorySummary = workbook.addWorksheet('Ringkasan Kategori', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  sheetCategorySummary.mergeCells('A1:E1');
  const catTitle = sheetCategorySummary.getCell('A1');
  catTitle.value = 'DOMPETKU – RINGKASAN & STATISTIK KATEGORI';
  catTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  catTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_DARK } };
  catTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetCategorySummary.getRow(1).height = 30;

  sheetCategorySummary.mergeCells('A2:E2');
  const catSub = sheetCategorySummary.getCell('A2');
  catSub.value = `Periode Laporan: ${periodLabel}  |  Dicetak pada: ${printTimestamp}`;
  catSub.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  catSub.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetCategorySummary.getRow(2).height = 20;

  sheetCategorySummary.addRow([]);

  const catSummaryHeader = sheetCategorySummary.addRow([
    'No',
    'Nama Kategori',
    'Jumlah Transaksi',
    'Total Nominal (Rp)',
    'Persentase Total (%)',
  ]);
  catSummaryHeader.height = 24;
  catSummaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  catSummaryHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  catSummaryHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_PRIMARY } };
    cell.border = {
      top: { style: 'thin', color: { argb: GRAY_BORDER } },
      bottom: { style: 'medium', color: { argb: NAVY_DARK } },
      left: { style: 'thin', color: { argb: GRAY_BORDER } },
      right: { style: 'thin', color: { argb: GRAY_BORDER } },
    };
  });

  categories.forEach((cat, idx) => {
    const catTxs = transactions.filter((t) => t.categoryId === cat.id);
    const amount = catTxs.reduce((sum, t) => sum + t.amount, 0);
    const percent = totalExpense > 0 ? amount / totalExpense : 0;

    const row = sheetCategorySummary.addRow([
      idx + 1,
      cat.name,
      catTxs.length,
      amount,
      percent,
    ]);

    row.height = 20;
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'left' };
    row.getCell(3).alignment = { horizontal: 'center' };
    row.getCell(4).numFmt = '"Rp "#,##0';
    row.getCell(5).numFmt = '0.0%';

    if (idx % 2 === 1) {
      row.eachCell((c) => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_LIGHT } };
      });
    }

    row.eachCell((c) => {
      c.border = {
        top: { style: 'thin', color: { argb: GRAY_BORDER } },
        bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
        left: { style: 'thin', color: { argb: GRAY_BORDER } },
        right: { style: 'thin', color: { argb: GRAY_BORDER } },
      };
    });
  });

  const startCatR = 5;
  const endCatR = startCatR + categories.length - 1;
  const catTotalRow = sheetCategorySummary.addRow([
    '',
    'TOTAL SEMUA KATEGORI',
    { formula: `SUM(C${startCatR}:C${endCatR})` },
    { formula: `SUM(D${startCatR}:D${endCatR})` },
    1.0,
  ]);
  catTotalRow.height = 24;
  catTotalRow.font = { bold: true };
  catTotalRow.getCell(2).alignment = { horizontal: 'right' };
  catTotalRow.getCell(3).alignment = { horizontal: 'center' };
  catTotalRow.getCell(4).numFmt = '"Rp "#,##0';
  catTotalRow.getCell(5).numFmt = '0.0%';
  catTotalRow.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE_LIGHT } };
    c.border = {
      top: { style: 'thin', color: { argb: BLUE_PRIMARY } },
      bottom: { style: 'double', color: { argb: BLUE_PRIMARY } },
    };
  });

  sheetCategorySummary.columns = [
    { width: 6 },
    { width: 28 },
    { width: 18 },
    { width: 24 },
    { width: 22 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
