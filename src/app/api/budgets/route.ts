import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyBudgets, setMonthlyBudget } from '@/lib/storage';

export async function GET() {
  try {
    const budgets = await getMonthlyBudgets();
    return NextResponse.json({ success: true, data: budgets });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data anggaran' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { monthYear, amount } = body;

    if (!monthYear) {
      return NextResponse.json(
        { success: false, message: 'Bulan (YYYY-MM) wajib disertakan' },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return NextResponse.json(
        { success: false, message: 'Nominal anggaran tidak boleh negatif!' },
        { status: 400 }
      );
    }

    const saved = await setMonthlyBudget(monthYear, numAmount);
    return NextResponse.json({ success: true, data: { monthYear, amount: saved } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan batas anggaran' },
      { status: 500 }
    );
  }
}
