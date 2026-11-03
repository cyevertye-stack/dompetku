import ExcelJS from 'exceljs';
import { Category, Transaction } from './types';
import { formatDateIndonesian, formatMonthIndonesian, formatRupiah } from './formatters';

interface ExportExcelParams {
  periodLabel: string;
  transactions: Transaction[];
  categories: Category[];
  totalBudget?: number;
}

export async function generateExpenseExcel({
  periodLabel,
  transactions,
  categories,
  totalBudget = 0,
}: ExportExcelParams): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DompetKu - Personal Expense Tracker';
  workbook.lastModifiedBy = 'DompetKu';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color Palette Constants
  const NAVY_DARK = '0F172A';
  const BLUE_PRIMARY = '1E3A8A';
  const BLUE_LIGHT = 'DBEAFE';
  const GRAY_LIGHT = 'F1F5F9';
  const GRAY_BORDER = 'CBD5E1';
  const GREEN_ACCENT = '059669';

  // Category map for quick lookup
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = totalBudget > 0 ? totalBudget - totalExpense : 0;

  // -------------------------------------------------------------
  // SHEET 1: Dashboard Keuangan
  // -------------------------------------------------------------
  const sheetDashboard = workbook.addWorksheet('Dashboard Keuangan', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  // Title Banner
  sheetDashboard.mergeCells('A1:G1');
  const titleCell = sheetDashboard.getCell('A1');
  titleCell.value = 'DOMPETKU – LAPORAN PENGELUARAN PRIBADI';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: NAVY_DARK },
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetDashboard.getRow(1).height = 36;

  // Subtitle / Period
  sheetDashboard.mergeCells('A2:G2');
  const subtitleCell = sheetDashboard.getCell('A2');
  subtitleCell.value = `Periode: ${periodLabel}  |  Dicetak pada: ${formatDateIndonesian(
    new Date().toISOString().split('T')[0],
    true
  )}`;
  subtitleCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF475569' } };
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetDashboard.getRow(2).height = 22;

  // Blank row
  sheetDashboard.addRow([]);

  // KPI CARDS Header
  sheetDashboard.mergeCells('A4:C4');
  const kpiTitle = sheetDashboard.getCell('A4');
  kpiTitle.value = 'RINGKASAN KEUANGAN UTAMA';
  kpiTitle.font = { name: 'Calibri', size: 12, bold: true, color: { argb: BLUE_PRIMARY } };

  // KPI 1: Total Pengeluaran
  sheetDashboard.mergeCells('A5:B5');
  sheetDashboard.getCell('A5').value = 'Total Pengeluaran:';
  sheetDashboard.getCell('A5').font = { bold: true };
  sheetDashboard.getCell('C5').value = totalExpense;
  sheetDashboard.getCell('C5').numFmt = '"Rp "#,##0';
  sheetDashboard.getCell('C5').font = { bold: true, size: 12, color: { argb: 'FFDC2626' } };

  // KPI 2: Total Transaksi
  sheetDashboard.mergeCells('A6:B6');
  sheetDashboard.getCell('A6').value = 'Jumlah Transaksi:';
  sheetDashboard.getCell('A6').font = { bold: true };
  sheetDashboard.getCell('C6').value = transactions.length;
  sheetDashboard.getCell('C6').numFmt = '#,##0';
  sheetDashboard.getCell('C6').font = { bold: true };

  // KPI 3: Rata-rata per Transaksi
  sheetDashboard.mergeCells('A7:B7');
  sheetDashboard.getCell('A7').value = 'Rata-rata per Transaksi:';
  sheetDashboard.getCell('A7').font = { bold: true };
  sheetDashboard.getCell('C7').value = transactions.length > 0 ? totalExpense / transactions.length : 0;
  sheetDashboard.getCell('C7').numFmt = '"Rp "#,##0';

  // KPI 4: Anggaran & Sisa
  if (totalBudget > 0) {
    sheetDashboard.mergeCells('E5:F5');
    sheetDashboard.getCell('E5').value = 'Batas Anggaran:';
    sheetDashboard.getCell('E5').font = { bold: true };
    sheetDashboard.getCell('G5').value = totalBudget;
    sheetDashboard.getCell('G5').numFmt = '"Rp "#,##0';
    sheetDashboard.getCell('G5').font = { bold: true, color: { argb: BLUE_PRIMARY } };

    sheetDashboard.mergeCells('E6:F6');
    sheetDashboard.getCell('E6').value = 'Sisa Anggaran:';
    sheetDashboard.getCell('E6').font = { bold: true };
    sheetDashboard.getCell('G6').value = remainingBudget;
    sheetDashboard.getCell('G6').numFmt = '"Rp "#,##0';
    sheetDashboard.getCell('G6').font = {
      bold: true,
      color: { argb: remainingBudget >= 0 ? GREEN_ACCENT : 'FFDC2626' },
    };

    sheetDashboard.mergeCells('E7:F7');
    sheetDashboard.getCell('E7').value = 'Status Anggaran:';
    sheetDashboard.getCell('E7').font = { bold: true };
    const usagePercent = Math.round((totalExpense / totalBudget) * 100);
    sheetDashboard.getCell('G7').value = `${usagePercent}% Terpakai`;
    sheetDashboard.getCell('G7').font = { bold: true };
  }

  // Category Breakdown Table in Dashboard
  sheetDashboard.addRow([]);
  sheetDashboard.mergeCells('A9:G9');
  const catSecHeader = sheetDashboard.getCell('A9');
  catSecHeader.value = 'RINCIAN PENGELUARAN PER KATEGORI';
  catSecHeader.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  catSecHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: BLUE_PRIMARY },
  };
  catSecHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetDashboard.getRow(9).height = 24;

  const catHeadRow = sheetDashboard.addRow([
    'No',
    'Kategori',
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
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: BLUE_LIGHT },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: GRAY_BORDER } },
      bottom: { style: 'medium', color: { argb: BLUE_PRIMARY } },
      left: { style: 'thin', color: { argb: GRAY_BORDER } },
      right: { style: 'thin', color: { argb: GRAY_BORDER } },
    };
  });

  // Calculate per category stats
  const catStats = categories.map((cat) => {
    const catTxs = transactions.filter((t) => t.categoryId === cat.id);
    const amount = catTxs.reduce((sum, t) => sum + t.amount, 0);
    const percent = totalExpense > 0 ? amount / totalExpense : 0;
    return {
      cat,
      count: catTxs.length,
      amount,
      percent,
    };
  }).filter((s) => s.count > 0 || s.cat.budgetLimit > 0)
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
    if (stat.cat.budgetLimit > 0) {
      row.getCell(6).numFmt = '"Rp "#,##0';
    }
    row.getCell(7).alignment = { horizontal: 'center' };

    if (stat.amount > (stat.cat.budgetLimit || 0) && stat.cat.budgetLimit > 0) {
      row.getCell(7).font = { bold: true, color: { argb: 'FFDC2626' } };
    } else if (statusText === 'Aman') {
      row.getCell(7).font = { bold: true, color: { argb: GREEN_ACCENT } };
    }

    // Zebra striping
    if (idx % 2 === 1) {
      row.eachCell((c) => {
        c.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: GRAY_LIGHT },
        };
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

  // Total Row in Dashboard
  const startRowCat = 11;
  const endRowCat = startRowCat + catStats.length - 1;
  if (catStats.length > 0) {
    const totalRow = sheetDashboard.addRow([
      '',
      'TOTAL KESELURUHAN',
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
      c.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: BLUE_LIGHT },
      };
      c.border = {
        top: { style: 'thin', color: { argb: BLUE_PRIMARY } },
        bottom: { style: 'double', color: { argb: BLUE_PRIMARY } },
      };
    });
  }

  // Auto-fit column widths for Sheet 1
  sheetDashboard.columns = [
    { width: 6 },
    { width: 26 },
    { width: 18 },
    { width: 24 },
    { width: 14 },
    { width: 22 },
    { width: 18 },
  ];

  // -------------------------------------------------------------
  // SHEET 2: Detail Transaksi
  // -------------------------------------------------------------
  const sheetTransactions = workbook.addWorksheet('Detail Transaksi', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  // Title
  sheetTransactions.mergeCells('A1:G1');
  const txTitle = sheetTransactions.getCell('A1');
  txTitle.value = 'DOMPETKU – DETAIL TRANSAKSI PENGELUARAN';
  txTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  txTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: NAVY_DARK },
  };
  txTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetTransactions.getRow(1).height = 30;

  // Subtitle
  sheetTransactions.mergeCells('A2:G2');
  const txSub = sheetTransactions.getCell('A2');
  txSub.value = `Filter Periode: ${periodLabel}  |  Total Transaksi: ${transactions.length}`;
  txSub.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  txSub.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetTransactions.getRow(2).height = 20;

  sheetTransactions.addRow([]);

  // Table Headers
  const headerRow = sheetTransactions.addRow([
    'No',
    'Tanggal',
    'Keterangan Pengeluaran',
    'Kategori',
    'Metode Pembayaran',
    'Nominal (Rp)',
    'Catatan',
  ]);
  headerRow.height = 25;
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: BLUE_PRIMARY },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'medium', color: { argb: NAVY_DARK } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    };
  });

  // Transactions rows
  transactions.forEach((tx, idx) => {
    const cat = categoryMap.get(tx.categoryId);
    const catName = cat ? cat.name : 'Lain-lain';

    const row = sheetTransactions.addRow([
      idx + 1,
      formatDateIndonesian(tx.date),
      tx.title,
      catName,
      tx.paymentMethod,
      tx.amount,
      tx.notes || '-',
    ]);

    row.height = 20;
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(3).alignment = { horizontal: 'left' };
    row.getCell(4).alignment = { horizontal: 'left' };
    row.getCell(5).alignment = { horizontal: 'center' };
    row.getCell(6).numFmt = '"Rp "#,##0';
    row.getCell(6).alignment = { horizontal: 'right' };
    row.getCell(7).alignment = { horizontal: 'left' };

    // Zebra stripes
    if (idx % 2 === 1) {
      row.eachCell((c) => {
        c.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: GRAY_LIGHT },
        };
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

  // Total Summary Row with Formula
  const startRow = 5;
  const endRow = startRow + transactions.length - 1;
  if (transactions.length > 0) {
    const totalRow = sheetTransactions.addRow([
      '',
      '',
      '',
      '',
      'TOTAL PENGELUARAN:',
      { formula: `SUM(F${startRow}:F${endRow})` },
      '',
    ]);
    totalRow.height = 24;
    totalRow.font = { bold: true };
    totalRow.getCell(5).alignment = { horizontal: 'right' };
    totalRow.getCell(6).numFmt = '"Rp "#,##0';
    totalRow.getCell(6).font = { bold: true, size: 11, color: { argb: 'FFDC2626' } };
    totalRow.eachCell((c) => {
      c.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: BLUE_LIGHT },
      };
      c.border = {
        top: { style: 'thin', color: { argb: BLUE_PRIMARY } },
        bottom: { style: 'double', color: { argb: BLUE_PRIMARY } },
      };
    });
  }

  // Enable AutoFilter on Transactions Table
  sheetTransactions.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: transactions.length > 0 ? endRow : 4, column: 7 },
  };

  // Set Column Widths for Sheet 2
  sheetTransactions.columns = [
    { width: 6 },  // No
    { width: 18 }, // Tanggal
    { width: 32 }, // Keterangan
    { width: 22 }, // Kategori
    { width: 24 }, // Metode Pembayaran
    { width: 22 }, // Nominal
    { width: 34 }, // Catatan
  ];

  // -------------------------------------------------------------
  // SHEET 3: Ringkasan Kategori
  // -------------------------------------------------------------
  const sheetCategorySummary = workbook.addWorksheet('Ringkasan Kategori', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  // Title
  sheetCategorySummary.mergeCells('A1:E1');
  const catTitle = sheetCategorySummary.getCell('A1');
  catTitle.value = 'DOMPETKU – RINGKASAN & STATISTIK KATEGORI';
  catTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  catTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: NAVY_DARK },
  };
  catTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetCategorySummary.getRow(1).height = 30;

  // Subtitle
  sheetCategorySummary.mergeCells('A2:E2');
  const catSub = sheetCategorySummary.getCell('A2');
  catSub.value = `Periode Laporan: ${periodLabel}`;
  catSub.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  catSub.alignment = { vertical: 'middle', horizontal: 'center' };
  sheetCategorySummary.getRow(2).height = 20;

  sheetCategorySummary.addRow([]);

  // Category Table Header
  const catSummaryHeader = sheetCategorySummary.addRow([
    'No',
    'Nama Kategori',
    'Jumlah Transaksi',
    'Total Pengeluaran (Rp)',
    'Persentase Total (%)',
  ]);
  catSummaryHeader.height = 24;
  catSummaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  catSummaryHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  catSummaryHeader.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: BLUE_PRIMARY },
    };
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
        c.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: GRAY_LIGHT },
        };
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

  // Category Total Row
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
    c.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: BLUE_LIGHT },
    };
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
