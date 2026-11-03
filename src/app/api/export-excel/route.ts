import { NextRequest, NextResponse } from 'next/server';
import { getCategories, getMonthlyBudgets, getTransactions } from '@/lib/storage';
import { generateExpenseExcel } from '@/lib/excel-export';
import { TransactionFilter } from '@/lib/types';
import { formatDateIndonesian, formatMonthIndonesian, getCurrentMonthString } from '@/lib/formatters';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const filter: TransactionFilter = {
      search: body.search || undefined,
      categoryId: body.categoryId || undefined,
      paymentMethod: body.paymentMethod || undefined,
      month: body.month || undefined,
      startDate: body.startDate || undefined,
      endDate: body.endDate || undefined,
      sortBy: body.sortBy || 'date-desc',
    };

    const transactions = await getTransactions(filter);
    const categories = await getCategories();
    const budgets = await getMonthlyBudgets();

    // Determine period label
    let periodLabel = 'Semua Transaksi';
    let targetMonth = getCurrentMonthString();
    let totalBudget = budgets[targetMonth] || 0;

    if (filter.month && filter.month !== 'all') {
      periodLabel = `Bulan ${formatMonthIndonesian(filter.month)}`;
      totalBudget = budgets[filter.month] || 0;
    } else if (filter.startDate && filter.endDate) {
      periodLabel = `${formatDateIndonesian(filter.startDate)} s/d ${formatDateIndonesian(filter.endDate)}`;
    } else if (filter.startDate) {
      periodLabel = `Mulai ${formatDateIndonesian(filter.startDate)}`;
    } else if (filter.endDate) {
      periodLabel = `Hingga ${formatDateIndonesian(filter.endDate)}`;
    }

    const excelBuffer = await generateExpenseExcel({
      periodLabel,
      transactions,
      categories,
      totalBudget,
    });

    const safePeriod = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Laporan_Pengeluaran_DompetKu_${safePeriod}.xlsx`;

    return new NextResponse(excelBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating Excel report:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengekspor laporan ke Microsoft Excel' },
      { status: 500 }
    );
  }
}
