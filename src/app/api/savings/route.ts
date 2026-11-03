import { NextRequest, NextResponse } from 'next/server';
import {
  deleteSavingsGoal,
  deleteSavingsTransaction,
  getSavingsGoals,
  getSavingsTransactions,
  saveSavingsGoal,
  saveSavingsTransaction,
} from '@/lib/storage';
import { getCurrentMonthString } from '@/lib/formatters';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const [goals, transactions] = await Promise.all([
      getSavingsGoals(userId),
      getSavingsTransactions(userId),
    ]);

    const currentMonth = getCurrentMonthString();

    // Total Saldo Tabungan (Deposit - Withdraw)
    const totalSavings = transactions.reduce((acc, t) => {
      return t.type === 'deposit' ? acc + t.amount : acc - t.amount;
    }, 0);

    // Tabungan Masuk Bulan Ini
    const savingsThisMonth = transactions
      .filter((t) => t.type === 'deposit' && t.date.startsWith(currentMonth))
      .reduce((acc, t) => acc + t.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        goals,
        transactions,
        totalSavings: Math.max(0, totalSavings),
        savingsThisMonth,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat data tabungan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, goal, transaction, userId } = body;

    if (action === 'goal') {
      if (!goal || !goal.title || typeof goal.targetAmount !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Data target tabungan tidak lengkap' },
          { status: 400 }
        );
      }
      const savedGoal = await saveSavingsGoal({
        ...goal,
        userId: userId || goal.userId,
      });
      return NextResponse.json({ success: true, data: savedGoal });
    }

    if (action === 'transaction' || (!action && transaction)) {
      const tx = transaction || body;
      if (!tx || typeof tx.amount !== 'number' || tx.amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Nominal tabungan harus lebih dari Rp 0' },
          { status: 400 }
        );
      }
      const savedTx = await saveSavingsTransaction({
        ...tx,
        userId: userId || tx.userId,
      });
      return NextResponse.json({ success: true, data: savedTx });
    }

    return NextResponse.json(
      { success: false, error: 'Aksi tidak dikenali' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyimpan tabungan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || undefined;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID tidak diberikan' },
        { status: 400 }
      );
    }

    if (type === 'goal') {
      await deleteSavingsGoal(id, userId);
      return NextResponse.json({ success: true, message: 'Target berhasil dihapus' });
    }

    await deleteSavingsTransaction(id, userId);
    return NextResponse.json({ success: true, message: 'Transaksi tabungan berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghapus' },
      { status: 500 }
    );
  }
}
